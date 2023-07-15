import { IFriendsBase, IUser } from '@app/types';
import * as mongoose from 'mongoose';
import {
  getFriendsipStatusForUserFromUsersAggregation,
  IGetUserListWithFriendshipStatusAggregationResult,
} from '../shared-aggregations/users.aggregation';

export class UsersDataManipulation<
  Friends extends IFriendsBase = IFriendsBase,
  Users extends Pick<IUser, 'cid'> = IUser,
> {
  constructor(
    private readonly friends: mongoose.Model<Friends>,
    private readonly users: mongoose.Model<Users>,
  ) {}

  public getUsersWithFriendshipStatus(
    userCId: string,
    matchPipeline: mongoose.PipelineStage[],
    afterPipeline: mongoose.PipelineStage[] = [],
  ) {
    return this.users.aggregate<
      IGetUserListWithFriendshipStatusAggregationResult<Users>
    >([
      ...matchPipeline,
      ...getFriendsipStatusForUserFromUsersAggregation(userCId),
      ...afterPipeline,
    ]);
  }

  public async getUserWithFriendshipStatus(
    userCId: string,
    matchPipeline: mongoose.PipelineStage[],
    afterPipeline: mongoose.PipelineStage[] = [],
    session?: mongoose.mongo.ClientSession,
  ): Promise<IGetUserListWithFriendshipStatusAggregationResult<Users> | null> {
    const [user] = await this.users.aggregate<
      IGetUserListWithFriendshipStatusAggregationResult<Users>
    >(
      [
        ...matchPipeline,
        ...getFriendsipStatusForUserFromUsersAggregation(userCId),
        ...afterPipeline,
      ],
      {
        session: session,
      },
    );
    return user ?? null;
  }

  public async deleteUser(userCId: string) {
    await this.friends.deleteMany({
      $or: [
        {
          requesterCId: userCId,
        },
        {
          recipientCId: userCId,
        },
      ],
    });

    await this.users.deleteMany({
      cid: userCId,
    });
  }
}
