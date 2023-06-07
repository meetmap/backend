import { RabbitMQExchanges, RMQConstants } from '@app/constants';
import { UpdateFriendshipRMQRequestDto } from '@app/dto/main-app/friends.dto';
import { RabbitmqService } from '@app/rabbitmq';
import { IMainAppSafeUser, IUser } from '@app/types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Post,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { FreindsDal } from './friends.dal';

@Injectable()
export class FriendsService {
  constructor(
    private readonly dal: FreindsDal,
    private readonly rmq: RabbitmqService,
  ) {}

  public async requestFriendship(requestorCId: string, friendCid: string) {
    const currentUser = await this.dal.getUserByCId(requestorCId);
    const friendUser = await this.dal.getUserByCId(friendCid);
    if (!currentUser) {
      throw new ForbiddenException("User doesn't exist");
    }
    if (!friendUser) {
      throw new NotFoundException("User doesn't exist");
    }
    if (!this.isValidFriend(currentUser, friendUser)) {
      throw new BadRequestException('Invalid user');
    }
    await this.dal.sendFriendshipRequest(currentUser.id, friendUser.id);
    return UsersService.mapUserDbToResponseUser(friendUser);
  }

  public async getIncomingFriendshipRequests(cid: string) {
    const user = await this.dal.getUserByCId(cid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    return await this.dal.getIncomingFriendshipRequests(user.id);
  }

  public async getOutcomingFriendshipRequests(cid: string) {
    const user = await this.dal.getUserByCId(cid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    return await this.dal.getOutcomingFriendshipRequests(user.id);
  }

  public async acceptFriendshipRequest(
    currentUserCid: string,
    requesterId: string,
  ) {
    const user = await this.dal.getUserByCId(currentUserCid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const requesterUser = await this.dal.getUserByCId(requesterId);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }
    await this.dal.acceptFriendshipRequest(user.id, requesterUser.id);

    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS.name,
      RMQConstants.exchanges.FRIENDS.routes.FRIEND_ADDED,
      {
        friendCid: requesterUser.cid,
        userCid: user.cid,
      } satisfies UpdateFriendshipRMQRequestDto,
    );

    return UsersService.mapUserDbToResponseUser(requesterUser);
  }
  public async rejectFriendshipRequest(
    currentUserCid: string,
    requesterCId: string,
  ) {
    const user = await this.dal.getUserByCId(currentUserCid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const requesterUser = await this.dal.getUserByCId(requesterCId);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }

    await this.dal.rejectFriendshipRequest(user.id, requesterUser.id);

    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS.name,
      RMQConstants.exchanges.FRIENDS.routes.FRIEND_REMOVED,
      {
        friendCid: requesterUser.cid,
        userCid: user.cid,
      } satisfies UpdateFriendshipRMQRequestDto,
    );

    return UsersService.mapUserDbToResponseUser(requesterUser);
  }

  public isValidFriend(
    user: Pick<IUser, 'id'>,
    friend: IUser | IMainAppSafeUser | null,
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

  public async getUserFriends(userCId: string, limit: number, page: number) {
    const user = await this.dal.getUserByCId(userCId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.dal.getUserFriends(user.id, limit, page);
  }

  // public async getFriendsLocation(userId: string) {
  //   const friends = await this.dal.getUserFriends(userId, 0, 0);
  //   const resp = await this.rmq.amqp.request<GetUserLocationResponseDto[]>({
  //     exchange: RabbitMQExchanges.LOCATION_EXCHANGE,
  //     routingKey: 'get-users-location',
  //     payload: {
  //       userIds: friends.map((friend) => friend.id),
  //     },
  //   });
  //   return resp;
  // }
}
