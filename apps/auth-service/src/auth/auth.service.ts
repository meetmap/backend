import { FacebookAuthProvider } from '@app/auth-providers/facebook';
import { JwtService } from '@app/auth/jwt';
import { MAX_AGE, MIN_AGE, RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
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

  public async handleUpdateUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  ) {
    await this.dal.updateUser(payload.cid, {
      name: payload.name,
      lastTimeOnline: payload.lastTimeOnline,
    });
  }

  public async createUser(
    payload: AppDto.AuthService.AuthDto.SignUpRequestDto,
  ) {
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
      // AuthService.mapToUserCreatedRmqRequest(
      AppDto.TransportDto.Users.UserCreatedRmqRequestDto.create({
        birthDate: user.birthDate,
        cid: user.cid,
        email: user.email,
        gender: user.gender,
        name: user.name,
        username: user.username,
        fbId: user.fbId,
        phone: user.phone,
      }),
    );
    return safeUser;
  }

  public async getTokensAndRefreshRT(
    user: Pick<AppTypes.AuthService.Users.IUser, 'id' | 'username' | 'cid'>,
  ) {
    const jwt = await this.jwtService.getTokens({
      sub: user.cid,
      username: user.username,
      cid: user.cid,
    });
    await this.updateUsersRefreshToken(user.cid, jwt.rt);
    return jwt;
  }

  public async loginWithPassword(
    payload: AppDto.AuthService.AuthDto.SignInWithPasswordRequestDto,
  ) {
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
    const user = await this.dal.findUserByCid(jwtPayload.cid);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const at = await this.jwtService.getAt(refreshToken);
    return at;
  }

  public async updateUsersRefreshToken(userCid: string, refreshToken: string) {
    return await this.dal.updateUsersRefreshToken(userCid, refreshToken);
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
    userCid: string,
    payload: AppDto.AuthService.AuthDto.UpdateUsernameRequestDto,
  ) {
    const updatedUser = await this.dal.updateUser(userCid, {
      username: payload.username,
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    const safeUser = AuthService.mapUserDbToResponseUser(updatedUser);
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      AuthService.mapToUserUpdatedRmqRequest({
        cid: userCid,
        username: payload.username,
      }) satisfies AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
    );
    return safeUser;
  }

  public async signUpWithFacebook(
    payload: AppDto.AuthService.AuthDto.SignUpWithAuthProviderRequestDto,
  ) {
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
      gender: payload.gender,
    });

    const safeUser = AuthService.mapUserDbToResponseUser(user);
    this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_CREATED,
      AppDto.TransportDto.Users.UserCreatedRmqRequestDto.create({
        birthDate: user.birthDate,
        cid: user.cid,
        email: user.email,
        gender: user.gender,
        name: user.name,
        username: user.username,
        fbId: user.fbId,
        phone: user.phone,
      }),
    );
    return safeUser;
  }

  public async loginWithFacebook(
    payload: AppDto.AuthService.AuthDto.SignInWithAuthProviderRequestDto,
  ) {
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

  public async linkFacebook(
    user: AppTypes.AuthService.Users.IUser,
    token: string,
  ) {
    const longLiveToken = await this.fbAuthProvider.getLongLiveToken(token);
    const fbUser = await this.fbAuthProvider.getUser(longLiveToken);
    const fbUserExists = await this.dal.getUserByFbId(fbUser.id);
    if (fbUserExists) {
      throw new ConflictException('User with this facebook already exists');
    }
    const updatedUser = await this.dal.linkFbToUser(user.cid, fbUser);
    if (!updatedUser) {
      throw new InternalServerErrorException("User hasn't been updated");
    }
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      AuthService.mapToUserUpdatedRmqRequest(
        updatedUser,
      ) satisfies AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
    );
    return updatedUser;
  }

  static mapToUserUpdatedRmqRequest(
    user: Partial<AppTypes.AuthService.Users.ISafeUser> & { cid: string },
  ): AppDto.TransportDto.Users.UserUpdatedRmqRequestDto {
    return AppDto.TransportDto.Users.UserUpdatedRmqRequestDto.create({
      email: user.email,
      phone: user.phone,
      username: user.username,
      birthDate: user.birthDate,
      cid: user.cid,
      gender: user.gender,
      // authUserId: user.id,
      fbId: user.fbId,
      name: user.name,
    });
  }

  static mapUserDbToResponseUser(
    user: AppTypes.AuthService.Users.ISafeUser,
  ): AppDto.AuthService.AuthDto.UserResponseDto {
    return AppDto.AuthService.AuthDto.UserResponseDto.create({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      birthDate: user.birthDate,
      cid: user.cid,
      name: user.name,
      fbId: user.fbId,
      gender: user.gender,
      lastTimeOnline: user.lastTimeOnline,
    });
  }
}
