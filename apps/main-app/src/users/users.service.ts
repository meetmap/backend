import { JwtService } from '@app/auth';
import { MAX_AGE, MIN_AGE, RabbitMQExchanges } from '@app/constants';
import { RabbitmqService } from '@app/rabbitmq';
import { IMainAppSafeUser, IUser } from '@app/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginWithPasswordDto,
  RefreshAccessTokenDto,
  UpdateUserLocationDto,
  UpdateUsersUsernameDto,
  UserRmqRequestDto,
} from './dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(
    private readonly dal: UsersDal,
    private readonly rmq: RabbitmqService,
    private readonly jwtService: JwtService,
  ) {}

  public async createUser(payload: UserRmqRequestDto) {
    const user = await this.dal.createUser(payload);
    return UsersService.mapUserDbToResponseUser(user);
  }

  public async updateUser(payload: UserRmqRequestDto) {
    const user = await this.dal.updateUser(payload.authUserId, payload);
    return user ? UsersService.mapUserDbToResponseUser(user) : null;
  }

  // public async updateUserLocation(userId: string, dto: UpdateUserLocationDto) {
  //   this.rmq.amqp.publish(
  //     RabbitMQExchanges.LOCATION_EXCHANGE,
  //     'update-location',
  //     {
  //       userId: userId,
  //       ...dto,
  //     },
  //   );
  //   return dto;
  // }

  public async getUserSelf(authUserId: string): Promise<IMainAppSafeUser> {
    const user = await this.dal.findUserByAuthUserId(authUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UsersService.mapUserDbToResponseUser(user);
  }

  public async findUsers(query: string): Promise<IMainAppSafeUser[]> {
    const users = await this.dal.findUsersByQueryUsername(query);
    return users.map((user) => UsersService.mapUserDbToResponseUser(user));
  }

  public async getUserById(userId: string): Promise<IMainAppSafeUser> {
    const user = await this.dal.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UsersService.mapUserDbToResponseUser(user);
  }

  static mapUserDbToResponseUser(
    user: IUser | IMainAppSafeUser,
  ): IMainAppSafeUser {
    return {
      id: user.id,
      birthDate: user.birthDate,
      friendsIds: user.friendsIds,
      email: user.email,
      phone: user.phone,
      username: user.username,
      // authUserId: user.authUserId,
    };
  }
}
