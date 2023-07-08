import { EventsFetcherDb } from '@app/database';
import { IEventWithUserStats, IRmqUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import { EventsDal } from '../events/events.dal';

@Injectable()
export class UsersDal {
  constructor(private readonly db: EventsFetcherDb) {}

  public async getEventsByUserAction(
    userCId: string,
    actionType: 'saved' | 'will-go' | 'liked',
  ) {
    return await this.db.models.eventsUsers.aggregate<IEventWithUserStats>([
      {
        $match: {
          userCId: userCId,
          isUserLike: actionType === 'liked',
          isUserSave: actionType === 'saved',
          isUserWillGo: actionType === 'will-go',
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
    return await this.db.models.user.create({
      cid: payload.cid,
      birthDate: payload.birthDate,
      description: payload.description,
      name: payload.name,
      profilePicture: payload.profilePicture,
      username: payload.username,
    });
  }
  public async updateUser(cid: string, payload: IRmqUser) {
    return await this.db.models.user.findOneAndUpdate(
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
    await this.db.models.user.deleteOne({ cid });
    await this.db.models.eventsUsers.deleteMany({ userCId: cid });
  }
}
