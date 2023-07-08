import { RMQConstants } from '@app/constants';
import { UpdateFriendshipRMQRequestDto } from '@app/dto/main-app/friends.dto';
import { RabbitmqService } from '@app/rabbitmq';
import {
  IMainAppSafePartialUser,
  IMainAppSafeUser,
  IMainAppUser,
  IUser,
} from '@app/types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { FriendsDal } from './friends.dal';

@Injectable()
export class FriendsService {
  constructor(
    private readonly dal: FriendsDal,
    private readonly rmq: RabbitmqService,
  ) {}

  public async requestFriendship(requestorCid: string, friendCid: string) {
    const currentUser = await this.dal.getUserByCId(requestorCid);
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
    await this.dal.sendFriendshipRequest(currentUser.cid, friendUser.cid);
    return UsersService.mapUserDbToResponsePartialUser(friendUser);
  }

  public async getIncomingFriendshipRequests(cid: string) {
    const user = await this.dal.getUserByCId(cid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    return await this.dal.getIncomingFriendshipRequests(user.cid);
  }

  public async getOutcomingFriendshipRequests(cid: string) {
    const user = await this.dal.getUserByCId(cid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    return await this.dal.getOutcomingFriendshipRequests(user.cid);
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
    await this.dal.acceptFriendshipRequest(user.cid, requesterUser.cid);

    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS.name,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED,
      {
        friendCId: requesterUser.cid,
        userCId: user.cid,
      } satisfies UpdateFriendshipRMQRequestDto,
    );

    return UsersService.mapUserDbToResponsePartialUser(requesterUser);
  }
  public async rejectFriendshipRequest(
    currentUserCid: string,
    requesterCid: string,
  ) {
    const user = await this.dal.getUserByCId(currentUserCid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const requesterUser = await this.dal.getUserByCId(requesterCid);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }

    await this.dal.rejectFriendshipRequest(user.cid, requesterUser.cid);

    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS.name,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REMOVED,
      {
        friendCId: requesterUser.cid,
        userCId: user.cid,
      } satisfies UpdateFriendshipRMQRequestDto,
    );

    return UsersService.mapUserDbToResponsePartialUser(requesterUser);
  }

  public isValidFriend(
    user: Pick<IMainAppUser, 'id' | 'cid'>,
    friend: IUser | IMainAppSafeUser | IMainAppSafePartialUser | null,
  ): friend is IMainAppUser {
    if (!friend) {
      throw new NotFoundException(`User not found`);
    }
    if (user.cid === friend.cid) {
      throw new BadRequestException(
        `Can not procceed friendship request to user itselfs`,
      );
    }
    return true;
  }

  public async getUserFriends(userCid: string, limit: number, page: number) {
    const user = await this.dal.getUserByCId(userCid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.dal.getUserFriends(user.cid, limit, page);
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
