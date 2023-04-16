import { JwtService } from '@app/auth';
import { MAX_AGE, MIN_AGE, RabbitMQExchanges } from '@app/constants';
import { RabbitmqService } from '@app/rabbitmq';
import { IUser } from '@app/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserRequestDto,
  LoginWithPasswordDto,
  RefreshAccessTokenDto,
  UpdateUserLocationDto,
  UpdateUsersUsernameDto,
} from './dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(
    private readonly dal: UsersDal,
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
    return this.mapUserDbToResponseUser(user);
  }

  public async getTokensAndRefreshRT(user: Pick<IUser, 'id' | 'username'>) {
    const jwt = await this.jwtService.getTokens({
      sub: user.id,
      username: user.username,
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
    const updatedUser = await this.dal.updateUser(userId, {
      username: payload.username,
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserDbToResponseUser(updatedUser);
  }

  public async updateUserLocation(userId: string, dto: UpdateUserLocationDto) {
    this.rmq.amqp.publish(
      RabbitMQExchanges.LOCATION_EXCHANGE,
      'update-location',
      {
        userId: userId,
        ...dto,
      },
    );
    return dto;
  }

  public async getUserSelf(
    userId: string,
  ): Promise<
    Pick<
      IUser,
      'birthDate' | 'friendsIds' | 'email' | 'phone' | 'username' | 'id'
    >
  > {
    const user = await this.dal.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserDbToResponseUser(user);
  }

  public mapUserDbToResponseUser(
    user: IUser,
  ): Pick<
    IUser,
    'birthDate' | 'friendsIds' | 'email' | 'phone' | 'username' | 'id'
  > {
    return {
      id: user.id,
      birthDate: user.birthDate,
      friendsIds: user.friendsIds,
      email: user.email,
      phone: user.phone,
      username: user.username,
    };
  }
}
