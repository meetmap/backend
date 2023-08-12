import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
import {
  getPaginatedResultAggregation,
  IPaginatedResult,
} from '../shared-aggregations';
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

  public async getUsersWithFriendshipStatus(
    userCId: string,
    page: number,
    matchPipeline: mongoose.PipelineStage[],
    afterPipeline: mongoose.PipelineStage[] = [],
  ) {
    const pageSize = 15;
    const [result] = await this.users.aggregate<
      IPaginatedResult<IGetUserListWithFriendshipStatusAggregationResult<Users>>
    >([
      ...matchPipeline,
      ...getFriendsipStatusForUserFromUsersAggregation(userCId),
      ...afterPipeline,
      ...getPaginatedResultAggregation(page, pageSize),
    ]);
    return result;
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
