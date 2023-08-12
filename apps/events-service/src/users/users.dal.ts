import { EventsServiceDatabase } from '@app/database';
import { getPaginatedResultAggregation } from '@app/database/shared-aggregations';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { AppTypes } from '@app/types';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventsDal } from '../events/events.dal';

@Injectable()
export class UsersDal implements OnModuleInit {
  constructor(private readonly db: EventsServiceDatabase) {}
  private dataManipulation: CommonDataManipulation<
    AppTypes.EventsService.Friends.IFriends,
    AppTypes.EventsService.Users.IUser
  >;

  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }

  public async getEventsByUserAction(
    userCId: string,
    actionType: 'liked',
    page: number = 1,
  ) {
    const pageSize = 15;
    const [result] = await this.db.models.eventsUsers.aggregate<
      AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>
    >([
      {
        $match: {
          userCId: userCId,
          isUserLike: actionType === 'liked',
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventCid',
          foreignField: 'cid',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      { $replaceRoot: { newRoot: '$event' } },
      ...EventsDal.getEventsWithUserStatsTagsAggregation(userCId),
      ...getPaginatedResultAggregation(page, pageSize),
    ]);
    return result;
  }

  public async createUser(payload: AppTypes.Transport.Users.IUser) {
    return await this.db.models.users.create({
      cid: payload.cid,
      birthDate: payload.birthDate,
      description: payload.description,
      name: payload.name,
      profilePicture: payload.profilePicture,
      username: payload.username,
      gender: payload.gender,
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Users.IUser>);
  }
  public async updateUser(
    cid: string,
    payload: AppTypes.Transport.Users.IUpdatedUser,
  ) {
    return await this.db.models.users.findOneAndUpdate(
      {
        cid,
      },
      {
        $set: {
          cid: payload.cid,
          birthDate: payload.birthDate,
          description: payload.description,
          name: payload.name,
          profilePicture: payload.profilePicture,
          username: payload.username,
          gender: payload.gender,
          lastTimeOnline: payload.lastTimeOnline,
        } satisfies Partial<
          AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Users.IUser>
        >,
      },
      {
        new: true,
      },
    );
  }

  public async deleteUser(cid: string) {
    await this.db.session(async (session) => {
      await this.dataManipulation.users.deleteUser(cid, session);
      await this.db.models.eventsUsers
        .deleteMany({ userCId: cid })
        .session(session);
    });

    return cid;
  }

  public async requestFriend(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.sendFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }

  public async acceptFriend(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.acceptFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }
  public async rejectFriend(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.rejectFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }
}
