import { JwtService } from '@app/auth';
import { MAX_AGE, MIN_AGE, RabbitMQExchanges } from '@app/constants';
import { UserRmqRequestDto } from '@app/dto/main-app/users.dto';
import { RabbitmqService } from '@app/rabbitmq';
import { IMainAppSafeUser, IUser } from '@app/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(
    private readonly dal: UsersDal,
    private readonly rmq: RabbitmqService,
  ) {}

  public async createUser(payload: UserRmqRequestDto) {
    const user = await this.dal.createUser(payload);
    return UsersService.mapUserDbToResponseUser(user);
  }

  public async updateUser(payload: UserRmqRequestDto) {
    const user = await this.dal.updateUser(payload.cid, payload);
    return user ? UsersService.mapUserDbToResponseUser(user) : null;
  }

  public async deleteUser(cid: string) {
    const userId = await this.dal.deleteUser(cid);
    return userId;
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

  public async getUserSelf(cid: string): Promise<IMainAppSafeUser> {
    const user = await this.dal.findUserByCorrelationId(cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UsersService.mapUserDbToResponseUser(user);
  }

  public async findUsers(query: string): Promise<IMainAppSafeUser[]> {
    const users = await this.dal.findUsersByQueryUsername(query);
    return users.map((user) => UsersService.mapUserDbToResponseUser(user));
  }

  public async getUserByCId(cid: string): Promise<IMainAppSafeUser> {
    const user = await this.dal.findUserByCId(cid);
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
      cid: user.cid,
      // authUserId: user.authUserId,
    };
  }
}
