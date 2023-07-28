import { AppTypes } from '@app/types';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { PipelineStage } from 'mongoose';
import {
  getFriendsUserListFromFriendsAggregation,
  getIncomingRequestsUserListFromFriendsAggregation,
  getOutcomingRequestsUserListFromFriendsAggregation,
  IGetUserListFromFriendsAggregationResult,
  IGetUserListWithFriendshipStatusAggregationResult,
} from '../shared-aggregations';

export class FriendsDataManipulation<
  Friends extends AppTypes.Shared.Friends.IFriendsBase = AppTypes.Shared.Friends.IFriendsBase,
  Users extends Pick<
    AppTypes.Shared.Users.IUsersBase,
    'cid'
  > = AppTypes.Shared.Users.IUsersBase,
> {
  constructor(
    private friends: mongoose.Model<Friends>,
    private users: mongoose.Model<Users>,
  ) {}
  /**
   *
   * @description Only for queues to update microservices
   */
  public async forceFriendship(
    userCId: string,
    recipientCId: string,
    session: mongoose.ClientSession,
  ) {
    if (userCId === recipientCId) {
      throw new BadRequestException(
        "User can't send friends request to himself",
      );
    }
    if (
      !(await this.users
        .find({
          cid: recipientCId,
        })
        .session(session))
    ) {
      throw new NotFoundException('Recipient not found');
    }
    if (
      await this.friends
        .findOne({
          requesterCId: userCId,
          recipientCId: recipientCId,
        })
        .session(session)
    ) {
      throw new ConflictException('Friendship request was already sent');
    }

    if (
      await this.friends
        .findOne({
          requesterCId: recipientCId,
          recipientCId: userCId,
        })
        .session(session)
    ) {
      throw new ConflictException(
        'You are recipient, need to accept or reject friendship',
      );
    }

    await this.friends
      .findOneAndUpdate(
        {
          requesterCId: userCId,
          recipientCId: recipientCId,
        },
        {
          $set: {
            status: AppTypes.Shared.Friends.FriendshipStatus.FRIENDS,
          },
        },
        {
          upsert: true,
          new: true,
        },
      )
      .session(session);
    // await this.users
    //   .findOneAndUpdate(
    //     {
    //       cid: userCId,
    //     },
    //     {
    //       $push: {
    //         friendsCIds: recipientCId,
    //       },
    //     },
    //   )
    //   .session(session);

    // await this.users
    //   .findOneAndUpdate(
    //     {
    //       cid: recipientCId,
    //     },
    //     {
    //       $push: {
    //         friendsCIds: userCId,
    //       },
    //     },
    //   )
    //   .session(session);
  }

  /**
   *
   * @param requesterCId means jwtUser
   * @param recipientCId means who request sends to
   */
  public async sendFriendshipRequest(
    requesterCId: string,
    recipientCId: string,
    session: mongoose.ClientSession,
  ) {
    if (requesterCId === recipientCId) {
      throw new BadRequestException(
        "User can't send friends request to himself",
      );
    }
    if (
      !(await this.users
        .find({
          cid: recipientCId,
        })
        .session(session))
    ) {
      throw new NotFoundException('Recipient not found');
    }
    if (
      await this.friends
        .findOne({
          requesterCId: requesterCId,
          recipientCId: recipientCId,
        })
        .session(session)
    ) {
      throw new ConflictException('Friendship request was already sent');
    }

    if (
      await this.friends
        .findOne({
          requesterCId: recipientCId,
          recipientCId: requesterCId,
        })
        .session(session)
    ) {
      throw new ConflictException(
        'You are recipient, need to accept or reject friendship',
      );
    }

    await this.friends
      .findOneAndUpdate(
        {
          requesterCId: requesterCId,
          recipientCId: recipientCId,
        },
        {
          $set: {
            status: AppTypes.Shared.Friends.FriendshipStatus.REQUESTED,
          },
        },
        {
          upsert: true,
          new: true,
        },
      )
      .session(session);
    // await this.friends.findOneAndUpdate(
    //   {
    //     recipientCId: requesterCId,
    //     requesterCId: recipientCId,
    //   },
    //   {
    //     $set: {
    //       status: AppTypes.Shared.Friends.FriendshipStatus.PENDING,
    //     },
    //   },
    //   {
    //     upsert: true,
    //     new: true,
    //   },
    // );

    // await this.users.findOneAndUpdate(
    //   { cid: requesterCId },
    //   {
    //     $push: {
    //       friendsCIds: recipientCId,
    //     },
    //   },
    // );
    // await this.users.findOneAndUpdate(
    //   { cid: recipientCId },
    //   {
    //     $push: {
    //       friendsCIds: requesterCId,
    //     },
    //   },
    // );
  }
  /**
   *
   * @param userCId means jwt user
   * @param requesterCId means who requested friendship
   */
  public async acceptFriendshipRequest(
    userCId: string,
    requesterCId: string,
    session: mongoose.ClientSession,
  ) {
    //check if user doesn't accept friendship requests himself
    if (userCId === requesterCId) {
      throw new ForbiddenException("Can't accept for yourself");
    }

    const friendRequest = await this.friends
      .findOne({
        requesterCId: requesterCId,
        recipientCId: userCId,
        status: AppTypes.Shared.Friends.FriendshipStatus.REQUESTED,
      })
      .session(session);

    if (!friendRequest) {
      throw new NotFoundException('No pending friend request from this user');
    }

    await this.friends
      .findOneAndUpdate(
        {
          requesterCId: requesterCId,
          recipientCId: userCId,
        },
        {
          $set: {
            status: AppTypes.Shared.Friends.FriendshipStatus.FRIENDS,
          },
        },
      )
      .session(session);

    // await this.users
    //   .findOneAndUpdate(
    //     {
    //       cid: userCId,
    //     },
    //     {
    //       $push: {
    //         friendsCIds: requesterCId,
    //       },
    //     },
    //   )
    //   .session(session);

    // await this.users
    //   .findOneAndUpdate(
    //     {
    //       cid: requesterCId,
    //     },
    //     {
    //       $push: {
    //         friendsCIds: userCId,
    //       },
    //     },
    //   )
    //   .session(session);
  }

  public async rejectFriendshipRequest(
    userCId: string,
    requesterCId: string,
    session: mongoose.ClientSession,
  ) {
    // Get the friend document
    const friendDoc = await this.friends
      .findOne({
        $or: [
          {
            requesterCId: requesterCId,
            recipientCId: userCId,
          },
          {
            requesterCId: userCId,
            recipientCId: requesterCId,
          },
        ],
      })
      .session(session);

    // If no such friend document exists, throw an exception
    if (!friendDoc) {
      throw new NotFoundException(
        'No friend request or friendship found with this user',
      );
    }

    //i.e userCId rejects current frienship and makes requesterCId follower
    if (friendDoc.status === AppTypes.Shared.Friends.FriendshipStatus.FRIENDS) {
      //delete existing
      friendDoc.status = AppTypes.Shared.Friends.FriendshipStatus.REQUESTED;
      friendDoc.recipientCId = userCId;
      friendDoc.requesterCId = requesterCId;
      await friendDoc.save({
        session,
      });
      return;
    }
    console.log({
      requesterCId: requesterCId,
      recipientCId: userCId,
    });
    //otherwise delete the friend document
    await this.friends
      .findOneAndRemove({
        $or: [
          {
            requesterCId: requesterCId,
            recipientCId: userCId,
          },
          {
            requesterCId: userCId,
            recipientCId: requesterCId,
          },
        ],
      })
      .session(session);
  }

  public async getUserFriends(
    currentUserCId: string,
    searchUserCId: string,
    limit: number,
    page: number,
  ) {
    const response = await this.friends.aggregate<
      IGetUserListWithFriendshipStatusAggregationResult<Users>
    >([
      ...getFriendsUserListFromFriendsAggregation(
        currentUserCId,
        searchUserCId,
      ),
    ]);
    return response; // response.map(({ friends }) => friends);
  }

  public async getIncomingFriendshipRequests(userCId: string) {
    return this.friends.aggregate<
      IGetUserListFromFriendsAggregationResult<Users>
    >([...getIncomingRequestsUserListFromFriendsAggregation(userCId)]);
  }

  public async getOutcomingFriendshipRequests(userCId: string) {
    return this.friends.aggregate<
      IGetUserListFromFriendsAggregationResult<Users>
    >([...getOutcomingRequestsUserListFromFriendsAggregation(userCId)]);
  }

  public async getUsersWithFriendshipStatus(
    userCId: string,
    matchPipeline: PipelineStage[],
  ) {
    this.friends.aggregate([...matchPipeline]);
  }
}
