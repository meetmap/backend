import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';

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
    const currentUser = await this.dal.getUserByCId(requestorCid, requestorCid);
    const friendUser = await this.dal.getUserByCId(requestorCid, friendCid);
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
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS.name,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REQUESTED,
      {
        friendCId: friendCid,
        userCId: requestorCid,
      } satisfies AppDto.TransportDto.Friends.UpdateFriendshipRMQRequestDto,
    );
    const updatedFriendUser = await this.dal.getUserByCId(
      requestorCid,
      friendCid,
    );

    if (!updatedFriendUser) {
      throw new NotFoundException(
        'Updated user not found, something went wrong',
      );
    }

    return UsersService.mapUserDbToResponsePartialUser(updatedFriendUser);
  }

  public async getIncomingFriendshipRequests(cid: string) {
    const user = await this.dal.getUserByCId(cid, cid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const incoming = await this.dal.getIncomingFriendshipRequests(user.cid);
    return incoming.map(UsersService.mapUserDbToResponsePartialUser);
  }

  public async getOutcomingFriendshipRequests(cid: string) {
    const user = await this.dal.getUserByCId(cid, cid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const outcoming = await this.dal.getOutcomingFriendshipRequests(user.cid);
    return outcoming.map(UsersService.mapUserDbToResponsePartialUser);
  }

  public async acceptFriendshipRequest(
    currentUserCid: string,
    requesterId: string,
  ) {
    const user = await this.dal.getUserByCId(currentUserCid, currentUserCid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const requesterUser = await this.dal.getUserByCId(
      currentUserCid,
      requesterId,
    );
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
      } satisfies AppDto.TransportDto.Friends.UpdateFriendshipRMQRequestDto,
    );

    return UsersService.mapUserDbToResponsePartialUser({
      ...requesterUser,
      friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus.FRIENDS,
    });
  }
  public async rejectFriendshipRequest(
    currentUserCid: string,
    requesterCid: string,
  ) {
    const user = await this.dal.getUserByCId(currentUserCid, currentUserCid);
    if (!user) {
      throw new ForbiddenException("User doesn't exist");
    }
    const requesterUser = await this.dal.getUserByCId(
      currentUserCid,
      requesterCid,
    );
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }

    await this.dal.rejectFriendshipRequest(user.cid, requesterUser.cid);

    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS.name,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REJECTED,
      {
        userCId: user.cid,
        friendCId: requesterUser.cid,
      } satisfies AppDto.TransportDto.Friends.UpdateFriendshipRMQRequestDto,
    );

    const updatedUser = await this.dal.getUserByCId(
      currentUserCid,
      requesterCid,
    );

    if (!updatedUser) {
      throw new NotFoundException(
        'Updated user not found, something went wrong',
      );
    }

    return UsersService.mapUserDbToResponsePartialUser(updatedUser);
  }

  public isValidFriend(
    user: Pick<AppTypes.UsersService.Users.IUser, 'id' | 'cid'>,
    friend: AppTypes.UsersService.Users.IUser | null,
  ): friend is AppTypes.UsersService.Users.IUser {
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

  public async getUserFriends(
    cuurentUserCId: string,
    searchUserCId: string,
    limit: number,
    page: number,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto[]> {
    const user = await this.dal.getUserByCId(cuurentUserCId, searchUserCId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = await this.dal.getUserFriends(
      cuurentUserCId,
      searchUserCId,
      limit,
      page,
    );

    return friends.map(UsersService.mapUserDbToResponsePartialUser);
  }
}
