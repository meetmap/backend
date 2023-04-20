import { RabbitMQExchanges } from '@app/constants';
import { RabbitmqService } from '@app/rabbitmq';
import { ISafeUser, IUser } from '@app/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { GetUserLocationResponseDto } from 'apps/location-service/src/location/dto';
import { UsersService } from '../users/users.service';
import { RequestFriendshipDto } from './dto';
import { FreindsDal } from './friends.dal';

@Injectable()
export class FriendsService {
  constructor(
    private readonly dal: FreindsDal,
    private readonly rmq: RabbitmqService,
  ) {}

  public async requestFriendship(user: IUser, userId: string) {
    const recipientUser = await this.dal.getUserById(userId);
    if (!this.isValidFriend(user, recipientUser)) {
      throw new BadRequestException('Invalid user');
    }
    await this.dal.sendFriendshipRequest(user.id, recipientUser.id);
    return UsersService.mapUserDbToResponseUser(recipientUser);
  }

  public async getIncomingFriendshipRequests(user: IUser) {
    return await this.dal.getIncomingFriendshipRequests(user.id);
  }

  public async getOutcomingFriendshipRequests(user: IUser) {
    return await this.dal.getOutcomingFriendshipRequests(user.id);
  }

  public async acceptFriendshipRequest(user: IUser, requesterId: string) {
    const requesterUser = await this.dal.getUserById(requesterId);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }
    await this.dal.acceptFriendshipRequest(user.id, requesterUser.id);
    return UsersService.mapUserDbToResponseUser(requesterUser);
  }
  public async rejectFriendshipRequest(user: IUser, requesterId: string) {
    const requesterUser = await this.dal.getUserById(requesterId);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }

    await this.dal.rejectFriendshipRequest(user.id, requesterUser.id);
    return UsersService.mapUserDbToResponseUser(requesterUser);
  }

  public isValidFriend(
    user: IUser,
    friend: IUser | ISafeUser | null,
  ): friend is IUser {
    if (!friend) {
      throw new NotFoundException(`User not found`);
    }
    if (user.id === friend.id) {
      throw new BadRequestException(
        `Can not procceed friendship request to user itselfs`,
      );
    }
    return true;
  }

  public async getUserFriends(userId: string, limit: number, page: number) {
    if (!(await this.dal.getUserById(userId))) {
      throw new NotFoundException('User not found');
    }
    return this.dal.getUserFriends(userId, limit, page);
  }

  public async getFriendsLocation(userId: string) {
    const friends = await this.dal.getUserFriends(userId, 0, 0);
    const resp = await this.rmq.amqp.request<GetUserLocationResponseDto[]>({
      exchange: RabbitMQExchanges.LOCATION_EXCHANGE,
      routingKey: 'get-users-location',
      payload: {
        userIds: friends.map((friend) => friend.id),
      },
    });
    return resp;
  }
}
