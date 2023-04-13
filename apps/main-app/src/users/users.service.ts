import { MAX_AGE, MIN_AGE } from '@app/constants';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserRequestDto,
  LoginWithPasswordDto,
  RefreshAccessTokenDto,
  UpdateUsersUsernameDto,
} from './dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

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
    return this.dal.createUser(payload);
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
    payload: UpdateUsersUsernameDto,
  ) {
    return await this.dal.updateUser(userId, { username: payload.username });
  }

  public async refreshAccessToken(payload: RefreshAccessTokenDto) {}
}
