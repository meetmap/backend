import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
import {
  getFriendsipStatusForUserFromUsersAggregation,
  IGetUserListWithFriendshipStatusAggregationResult,
} from '../shared-aggregations/users.aggregation';

export class UsersDataManipulation<
  Friends extends AppTypes.Shared.Friends.IFriendsBase = AppTypes.Shared.Friends.IFriendsBase,
  Users extends Pick<
    AppTypes.Shared.Users.IUsersBase,
    'cid'
  > = AppTypes.Shared.Users.IUsersBase,
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

  public async deleteUser(userCId: string, session: mongoose.ClientSession) {
    await this.friends
      .deleteMany({
        $or: [
          {
            requesterCId: userCId,
          },
          {
            recipientCId: userCId,
          },
        ],
      })
      .session(session);

    await this.users
      .deleteMany({
        cid: userCId,
      })
      .session(session);
  }
}
