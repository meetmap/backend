import { EventsFetcherDb } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import {
  IEventsServiceFriends,
  IEventsServiceUser,
  IEventWithUserStats,
  IRmqUser,
} from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventsDal } from '../events/events.dal';

@Injectable()
export class UsersDal implements OnModuleInit {
  constructor(private readonly db: EventsFetcherDb) {}
  private dataManipulation: CommonDataManipulation<
    IEventsServiceFriends,
    IEventsServiceUser
  >;

  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }

  public async getEventsByUserAction(userCId: string, actionType: 'liked') {
    return await this.db.models.eventsUsers.aggregate<IEventWithUserStats>([
      {
        $match: {
          userCId: userCId,
          isUserLike: actionType === 'liked',
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      { $replaceRoot: { newRoot: '$event' } },
      ...EventsDal.getEventsWithUserStatsAggregation(userCId),
    ]);
  }

  public async createUser(payload: IRmqUser) {
    return await this.db.models.users.create({
      cid: payload.cid,
      birthDate: payload.birthDate,
      description: payload.description,
      name: payload.name,
      profilePicture: payload.profilePicture,
      username: payload.username,
    });
  }
  public async updateUser(cid: string, payload: IRmqUser) {
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
        },
      },
      {
        new: true,
        upsert: true,
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
