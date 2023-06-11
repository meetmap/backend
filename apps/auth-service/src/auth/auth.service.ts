import { JwtService } from '@app/auth';
import { MAX_AGE, MIN_AGE, RMQConstants } from '@app/constants';
import {
  CreateUserRequestDto,
  LoginWithPasswordDto,
  UpdateUsersUsernameRequestDto,
} from '@app/dto/auth-service/auth.dto';
import { UserRmqRequestDto } from '@app/dto/main-app/users.dto';
import { RabbitmqService } from '@app/rabbitmq';
import { ISafeAuthUser, IMainAppSafeUser, IUser } from '@app/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
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
  ) {}

  public async createUser(payload: CreateUserRequestDto) {
    if (!this.isValidBirthDate(payload.birthDate)) {
      throw new BadRequestException(
        `Invalid birth date, min age is ${MIN_AGE} years and max age is ${MAX_AGE} years`,
      );
    }
    const userExists = await this.dal.findUserByEmail(payload.email);
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const user = await this.dal.createUser(payload);
    const safeUser = AuthService.mapUserDbToResponseUser(user);
    this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routes.USER_CREATED,
      this.mapUserDbToRmqRequest(user) satisfies UserRmqRequestDto,
    );
    return safeUser;
  }

  public async getTokensAndRefreshRT(
    user: Pick<IUser, 'id' | 'username' | 'cid'>,
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
    console.log('zalupa');
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
    this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routes.USER_UPDATED,
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

  private mapUserDbToRmqRequest(user: ISafeAuthUser): UserRmqRequestDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      birthDate: user.birthDate,
      cid: user.cid,
      authUserId: user.id,
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
    };
  }
}
