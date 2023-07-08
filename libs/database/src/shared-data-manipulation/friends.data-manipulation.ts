import { FriendshipStatus, IFriendsBase, IUser } from '@app/types';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import {
  getUserListFromFriendsAggregation,
  IGetUserListFromFriendsAggregationResult,
} from '../shared-aggregations';

export class FriendsDataManipulation<
  Friends extends IFriendsBase = IFriendsBase,
  Users extends Pick<IUser, 'cid' | 'friendsCIds'> = IUser,
> {
  constructor(
    private readonly friends: mongoose.Model<Friends>,
    private readonly users: mongoose.Model<Users>,
  ) {}
  /**
   *
   * @description Only for queues to update microservices
   */
  public async forceFriendship(userCId: string, requesterCId: string) {
    const isUserExists = await this.users.find({
      cid: userCId,
    });
    const isRequesterExists = await this.users.find({
      cid: requesterCId,
    });
    if (!isUserExists) {
      throw new NotFoundException('User not found');
    }
    if (!isRequesterExists) {
      throw new NotFoundException('Recipient not found');
    }
    if (
      await this.friends.findOne({
        requesterCId: requesterCId,
        recipientCId: userCId,
      })
    ) {
      throw new ConflictException('Friendship request was already sent');
    }

    await this.friends.findOneAndUpdate(
      {
        requesterCId: requesterCId,
        recipientCId: userCId,
      },
      {
        $set: {
          status: FriendshipStatus.FRIENDS,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.friends.findOneAndUpdate(
      {
        recipientCId: requesterCId,
        requesterCId: userCId,
      },
      {
        $set: {
          status: FriendshipStatus.FRIENDS,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.users.findOneAndUpdate(
      { cid: requesterCId },
      {
        $push: {
          friendsCIds: userCId,
        },
      },
    );
    await this.users.findOneAndUpdate(
      { cid: userCId },
      {
        $push: {
          friendsCIds: requesterCId,
        },
      },
    );
  }
  public async sendFriendshipRequest(
    requesterCId: string,
    recipientCId: string,
  ) {
    if (
      !(await this.users.find({
        cid: recipientCId,
      }))
    ) {
      throw new NotFoundException('Recipient not found');
    }
    if (
      await this.friends.findOne({
        requesterCId: requesterCId,
        recipientCId: recipientCId,
      })
    ) {
      throw new ConflictException('Friendship request was already sent');
    }
    await this.friends.findOneAndUpdate(
      {
        requesterCId: requesterCId,
        recipientCId: recipientCId,
      },
      {
        $set: {
          status: FriendshipStatus.REQUESTED,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.friends.findOneAndUpdate(
      {
        recipientCId: requesterCId,
        requesterCId: recipientCId,
      },
      {
        $set: {
          status: FriendshipStatus.PENDING,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.users.findOneAndUpdate(
      { cid: requesterCId },
      {
        $push: {
          friendsCIds: recipientCId,
        },
      },
    );
    await this.users.findOneAndUpdate(
      { cid: recipientCId },
      {
        $push: {
          friendsCIds: requesterCId,
        },
      },
    );
  }
  public async acceptFriendshipRequest(userCId: string, requesterCId: string) {
    //check if user doesn't accept friendship requests himself

    if (
      await this.friends.findOne({
        requesterCId: userCId,
        recipientCId: requesterCId,
        status: FriendshipStatus.REQUESTED,
      })
    ) {
      throw new ForbiddenException(
        'User can not accept friendship requests himself',
      );
    }

    await this.friends.findOneAndUpdate(
      {
        requesterCId: userCId,
        recipientCId: requesterCId,
      },
      {
        $set: {
          status: FriendshipStatus.FRIENDS,
        },
      },
    );

    await this.friends.findOneAndUpdate(
      {
        requesterCId: requesterCId,
        recipientCId: userCId,
      },
      {
        $set: {
          status: FriendshipStatus.FRIENDS,
        },
      },
    );
  }

  public async rejectFriendshipRequest(userCId: string, requesterCId: string) {
    await this.friends.findOneAndRemove({
      requesterCId: userCId,
      recipientCId: requesterCId,
    });

    await this.friends.findOneAndRemove({
      requesterCId: requesterCId,
      recipientCId: userCId,
    });
    await this.users.findOneAndUpdate(
      { cid: requesterCId },
      {
        $pull: {
          friendsCIds: userCId,
        },
      },
    );

    await this.users.findOneAndUpdate(
      { cid: userCId },
      {
        $pull: {
          friendsCIds: requesterCId,
        },
      },
    );
  }

  public async getUserFriends(userCId: string, limit: number, page: number) {
    const response = await this.friends.aggregate<
      IGetUserListFromFriendsAggregationResult<Users>
    >([
      {
        $match: {
          status: FriendshipStatus.FRIENDS,
          requesterCId: userCId,
        },
      },
      ...getUserListFromFriendsAggregation('recipient'),
    ]);
    return response; // response.map(({ friends }) => friends);
  }

  public async getIncomingFriendshipRequests(userCId: string) {
    return this.friends.aggregate<
      IGetUserListFromFriendsAggregationResult<Users>
    >([
      {
        $match: {
          status: FriendshipStatus.REQUESTED,
          recipientCId: userCId,
        },
      },
      ...getUserListFromFriendsAggregation('requester'),
    ]);
  }

  public async getOutcomingFriendshipRequests(userCId: string) {
    return this.friends.aggregate<
      IGetUserListFromFriendsAggregationResult<Users>
    >([
      {
        $match: {
          status: FriendshipStatus.REQUESTED,
          requesterCId: userCId,
        },
      },
      ...getUserListFromFriendsAggregation('recipient'),
    ]);
  }
}
