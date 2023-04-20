import { MainAppDatabase } from '@app/database';
import { IFriends, ISafeUser, IUser } from '@app/types';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as mongoose from 'mongoose';
import { UsersService } from '../users/users.service';

@Injectable()
export class FreindsDal {
  constructor(private readonly db: MainAppDatabase) {}

  public async getUserByUsername(username: string): Promise<ISafeUser | null> {
    const user = await this.db.models.users.findOne(
      {
        username: username,
      },
      {
        id: true,
        birthDate: true,
        email: true,
        friendsIds: true,
        username: true,
        phone: true,
      },
    );
    if (user) {
      return UsersService.mapUserDbToResponseUser(user);
    }
    return null;
  }

  public async getUserById(userId: string): Promise<ISafeUser | null> {
    const user = await this.db.models.users.findById(userId, {
      id: true,
      birthDate: true,
      email: true,
      friendsIds: true,
      username: true,
      phone: true,
    });
    if (user) {
      return UsersService.mapUserDbToResponseUser(user);
    }
    return null;
  }

  public async sendFriendshipRequest(requesterId: string, recipientId: string) {
    if (
      (await this.db.models.friends.findOne({
        requester: requesterId,
        recipient: recipientId,
      })) && {
        requester: recipientId,
        recipient: requesterId,
      }
    ) {
      throw new ConflictException('Friendship request was already sent');
    }
    await this.db.models.friends.findOneAndUpdate(
      {
        requester: requesterId,
        recipient: recipientId,
      },
      {
        $set: {
          status: 'requested',
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.db.models.friends.findOneAndUpdate(
      {
        recipient: requesterId,
        requester: recipientId,
      },
      {
        $set: {
          status: 'pending',
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.db.models.users.findByIdAndUpdate(requesterId, {
      $push: {
        friendsIds: recipientId,
      },
    });

    await this.db.models.users.findByIdAndUpdate(recipientId, {
      $push: {
        friendsIds: requesterId,
      },
    });
  }
  public async acceptFriendshipRequest(userId: string, requesterId: string) {
    //check if user doesn't accept friendship requests himself

    if (
      await this.db.models.friends.findOne({
        requester: userId,
        recipient: requesterId,
        status: 'requested',
      })
    ) {
      throw new ForbiddenException(
        'User can not accept friendship requests himself',
      );
    }

    await this.db.models.friends.findOneAndUpdate(
      {
        requester: userId,
        recipient: requesterId,
      },
      {
        $set: {
          status: 'friends',
        },
      },
    );

    await this.db.models.friends.findOneAndUpdate(
      {
        requester: requesterId,
        recipient: userId,
      },
      {
        $set: {
          status: 'friends',
        },
      },
    );
  }

  public async rejectFriendshipRequest(userId: string, requesterId: string) {
    await this.db.models.friends.findOneAndRemove({
      requester: userId,
      recipient: requesterId,
    });

    await this.db.models.friends.findOneAndRemove({
      requester: requesterId,
      recipient: userId,
    });
    await this.db.models.users.findByIdAndUpdate(requesterId, {
      $pull: {
        friendsIds: userId,
      },
    });

    await this.db.models.users.findByIdAndUpdate(userId, {
      $pull: {
        friendsIds: requesterId,
      },
    });
  }

  public async getUserFriends(userId: string, limit: number, page: number) {
    const response =
      await this.db.models.friends.aggregate<IUserFromFirendsAggregationResult>(
        [
          {
            $match: {
              status: 'friends',
              requester: new mongoose.Types.ObjectId(userId),
            },
          },
          ...this.getUserListFromFriendsAggregation('recipient'),
        ],
      );
    return response; // response.map(({ friends }) => friends);
  }

  public async getIncomingFriendshipRequests(userId: string) {
    return this.db.models.friends.aggregate<IUserFromFirendsAggregationResult>([
      {
        $match: {
          status: 'requested',
          recipient: new mongoose.Types.ObjectId(userId),
        },
      },
      ...this.getUserListFromFriendsAggregation('requester'),
    ]);
  }

  public async getOutcomingFriendshipRequests(userId: string) {
    return this.db.models.friends.aggregate<IUserFromFirendsAggregationResult>([
      {
        $match: {
          status: 'requested',
          requester: new mongoose.Types.ObjectId(userId),
        },
      },
      ...this.getUserListFromFriendsAggregation('recipient'),
    ]);
  }

  private getUserListFromFriendsAggregation(
    from: keyof Pick<IFriends, 'requester' | 'recipient'>,
  ) {
    return [
      {
        $lookup: {
          from: 'users',
          // localField: 'recipient',
          localField: from,
          foreignField: '_id',
          as: 'friends',
        },
      },
      {
        $unwind: {
          path: '$friends',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          friends: 1,
        },
      },
      {
        $replaceRoot: {
          newRoot: '$friends',
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          // coordinates: 1,
          email: 1,
          phone: 1,
          birthDate: 1,
          friendsIds: 1,
        },
      },
      {
        $addFields: {
          id: {
            $toString: '$_id',
          },
        },
      },
    ];
  }
}

export interface IUserFromFirendsAggregationResult
  extends Pick<
    IUser,
    'username' | 'email' | 'phone' | 'birthDate' | 'friendsIds' | 'id'
  > {}
