import { FacebookAuthProvider } from '@app/auth-providers/facebook';
import { JwtService } from '@app/auth/jwt';
import { MAX_AGE, MIN_AGE, RMQConstants } from '@app/constants';
import {
  CreateUserRequestDto,
  LoginWithAuthProviderRequestDto,
  LoginWithPasswordDto,
  SignUpWithAuthProviderRequestDto,
  UpdateUsersUsernameRequestDto,
} from '@app/dto/auth-service/auth.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common/users.dto';
import { RabbitmqService } from '@app/rabbitmq';
import { IAuthUser, ISafeAuthUser } from '@app/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDal } from './auth.dal';

@Injectable()
export class AuthService {
  constructor(
    private readonly dal: AuthDal,
    private readonly rmq: RabbitmqService,
    private readonly jwtService: JwtService,
    private readonly fbAuthProvider: FacebookAuthProvider,
  ) {}

  public async createUser(payload: CreateUserRequestDto) {
    if (!this.isValidBirthDate(payload.birthDate)) {
      throw new BadRequestException(
        `Invalid birth date, min age is ${MIN_AGE} years and max age is ${MAX_AGE} years`,
      );
    }
    const userExists =
      (await this.dal.findUserByEmail(payload.email)) ||
      (await this.dal.findUserByUsername(payload.username));
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const user = await this.dal.createUser(payload);
    const safeUser = AuthService.mapUserDbToResponseUser(user);
    this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_CREATED,
      this.mapUserDbToRmqRequest(user) satisfies UserRmqRequestDto,
    );
    return safeUser;
  }

  public async getTokensAndRefreshRT(
    user: Pick<IAuthUser, 'id' | 'username' | 'cid'>,
  ) {
    const jwt = await this.jwtService.getTokens({
      sub: user.id,
      username: user.username,
      cid: user.cid,
    });
    await this.updateUsersRefreshToken(user.id, jwt.rt);
    return jwt;
  }

  public async loginWithPassword(payload: LoginWithPasswordDto) {
    if (payload.username) {
      return this.loginWithUsernameAndPassword(
        payload.username,
        payload.password,
      );
    }
    if (payload.email) {
      return this.loginWithEmailAndPassword(payload.email, payload.password);
    }
    if (payload.phone) {
      return this.loginWithPhoneAndPassword(payload.phone, payload.password);
    }
  }

  public async refreshAccessToken(refreshToken: string) {
    const jwtPayload = await this.jwtService.verifyRt(refreshToken);
    const user = await this.dal.findUserById(jwtPayload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const at = await this.jwtService.getAt(refreshToken);
    return at;
  }

  public async updateUsersRefreshToken(userId: string, refreshToken: string) {
    return await this.dal.updateUsersRefreshToken(userId, refreshToken);
  }
  public async loginWithUsernameAndPassword(
    username: string,
    password: string,
  ) {
    const user = await this.dal.findUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Username or password is wrong');
    }
    const isValidPassword = await this.dal.comparePassword(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Username or password is wrong');
    }
    return user;
  }
  public async loginWithEmailAndPassword(email: string, password: string) {
    const user = await this.dal.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const isValidPassword = await this.dal.comparePassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    return user;
  }
  public async loginWithPhoneAndPassword(phone: string, password: string) {
    const user = await this.dal.findUserByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('Phone or password is wrong');
    }
    const isValidPassword = await this.dal.comparePassword(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Phone or password is wrong');
    }
    return user;
  }

  public async usernameIsFree(username: string) {
    return !this.dal.findUserByUsername(username);
  }

  public async phoneIsFree(phone: string) {
    return !this.dal.findUserByPhone(phone);
  }

  public isValidBirthDate(birthDate: Date | string) {
    const parsedDate = new Date(birthDate);
    const currentDate = new Date();
    const minDate = new Date().setFullYear(currentDate.getFullYear() - MAX_AGE);
    const maxDate = new Date().setFullYear(currentDate.getFullYear() - MIN_AGE);
    if (+parsedDate >= +minDate && +parsedDate <= maxDate) {
      return true;
    }
    return false;
  }
  public async updateUsersUsername(
    userId: string,
    payload: UpdateUsersUsernameRequestDto,
  ) {
    const updatedUser = await this.dal.updateUser(userId, {
      username: payload.username,
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    const safeUser = AuthService.mapUserDbToResponseUser(updatedUser);
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      this.mapUserDbToRmqRequest(updatedUser) satisfies UserRmqRequestDto,
    );
    return safeUser;
  }

  public async getUserById(userId: string) {
    const user = await this.dal.getUserById(userId);
    if (!user) {
      return null;
    }
    return AuthService.mapUserDbToResponseUser(user);
  }

  public async getUserByIdBulk(userIds: string[]) {
    const users = await this.dal.getUserByIdBulk(userIds);

    return users.map((user) =>
      user ? AuthService.mapUserDbToResponseUser(user) : null,
    );
  }

  public async signUpWithFacebook(payload: SignUpWithAuthProviderRequestDto) {
    const longLiveToken = await this.fbAuthProvider.getLongLiveToken(
      payload.token,
    );
    const fbUser = await this.fbAuthProvider.getUser(longLiveToken);
    const email = fbUser.email ?? payload.email;
    const phone = fbUser.phone ?? payload.phone;
    const birthDate = fbUser.birthDate ?? payload.birthDate;
    const name = fbUser.name ?? payload.name;
    if (!email) {
      throw new BadRequestException("Email hasn't been provided");
    }
    if (!birthDate) {
      throw new BadRequestException("Birth date hasn't been provided");
    }
    if (!this.isValidBirthDate(birthDate)) {
      throw new BadRequestException(
        `Invalid birth date, min age is ${MIN_AGE} years and max age is ${MAX_AGE} years`,
      );
    }
    if (await this.dal.getUserByFbId(fbUser.id)) {
      throw new ConflictException('User with this facebook already exists');
    }

    const userExists =
      (await this.dal.findUserByEmail(email)) ||
      (await this.dal.findUserByUsername(payload.username));
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.dal.createUserWithAuthProvider({
      birthDate: birthDate,
      email: email,
      username: payload.username,
      fbId: fbUser.id,
      fbToken: fbUser.token,
      phone: phone,
      name: name,
    });

    const safeUser = AuthService.mapUserDbToResponseUser(user);
    this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_CREATED,
      this.mapUserDbToRmqRequest(user) satisfies UserRmqRequestDto,
    );
    return safeUser;
  }

  public async loginWithFacebook(payload: LoginWithAuthProviderRequestDto) {
    const longLiveToken = await this.fbAuthProvider.getLongLiveToken(
      payload.token,
    );
    const fbUser = await this.fbAuthProvider.getUser(longLiveToken);
    const user = await this.dal.getUserByFbId(fbUser.id);
    if (!user) {
      throw new NotFoundException("User with this facebook doesn't exist");
    }

    const safeUser = AuthService.mapUserDbToResponseUser(user);
    return safeUser;
  }

  public async linkFacebook(user: IAuthUser, token: string) {
    const longLiveToken = await this.fbAuthProvider.getLongLiveToken(token);
    const fbUser = await this.fbAuthProvider.getUser(longLiveToken);
    const fbUserExists = await this.dal.getUserByFbId(fbUser.id);
    if (fbUserExists) {
      throw new ConflictException('User with this facebook already exists');
    }
    const updatedUser = await this.dal.linkFbToUser(user.id, fbUser);
    if (!updatedUser) {
      throw new InternalServerErrorException("User hasn't been updated");
    }
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      this.mapUserDbToRmqRequest(updatedUser) satisfies UserRmqRequestDto,
    );
    return updatedUser;
  }

  private mapUserDbToRmqRequest(user: ISafeAuthUser): UserRmqRequestDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      birthDate: user.birthDate,
      cid: user.cid,
      // authUserId: user.id,
      fbId: user.fbId,
      name: user.name,
    };
  }

  static mapUserDbToResponseUser(user: ISafeAuthUser): ISafeAuthUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      birthDate: user.birthDate,
      cid: user.cid,
      name: user.name,
      fbId: user.fbId,
    };
  }
}
