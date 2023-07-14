import { RADIANS_PER_KILOMETER } from '@app/constants';
import { EventsFetcherDb } from '@app/database';
import { CreateEventSchema } from '@app/dto/events-fetcher/events.dto';
import { S3UploaderService } from '@app/s3-uploader';
import {
  CreatorType,
  EventsUsersStatusType,
  ICity,
  IEvent,
  IEventsServiceUser,
  IEventStats,
  IEventWithUserStats,
  ILocation,
  ITicket,
} from '@app/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { z } from 'zod';
@Injectable()
export class EventsDal {
  constructor(
    private readonly db: EventsFetcherDb,
    private readonly s3Service: S3UploaderService,
  ) {}

  public async getEventById(eventId: string): Promise<IEvent | null> {
    const event = await this.db.models.event.findById(eventId);
    if (!event) {
      return null;
    }
    return event.toObject();
  }

  public async getUsersLikedAnEvent(eventId: string) {
    return await this.db.models.eventsUsers.aggregate<IEventsServiceUser>([
      {
        $match: {
          isUserLike: true,
          event: new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userCId',
          foreignField: 'cid',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $replaceRoot: { newRoot: '$user' } },
    ]);
  }

  public async userAction(
    userCId: string,
    eventId: string,
    action: 'like' | 'want-go',
  ) {
    const response = await this.db.models.eventsUsers.findOneAndUpdate(
      {
        userCId,
        event: eventId,
      },
      {
        $set: {
          isUserLike: action === 'like' ? true : undefined,
          userStatus:
            action === 'want-go' ? EventsUsersStatusType.WANT_GO : undefined,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
    return response.toObject();
  }

  public async cancelUserAction(
    userCId: string,
    eventId: string,
    action: 'like' | 'want-go',
  ) {
    const response = await this.db.models.eventsUsers.findOneAndUpdate(
      {
        userCId,
        event: eventId,
      },
      {
        $set: {
          isUserLike: action === 'like' ? false : undefined,
        },
        $unset: {
          userStatus: action === 'want-go' ? 1 : undefined,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
    return response.toObject();
  }

  public async getEventUserStats(
    eventId: string,
    userCId: string,
  ): Promise<IEventWithUserStats['userStats']> {
    const stats = await this.db.models.eventsUsers.findOne({
      event: new mongoose.Types.ObjectId(eventId),
      userCId,
    });

    return {
      isUserLike: !!stats?.isUserLike,
      userStatus: stats?.userStatus,
    };
  }

  public async getEventStats(eventId: string): Promise<IEventStats> {
    const [stats] = await this.db.models.eventsUsers.aggregate<IEventStats>([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $group: {
          _id: null,
          likes: { $sum: { $cond: [{ $eq: ['$isUserLike', true] }, 1, 0] } },
          wantGo: {
            $sum: {
              $cond: [
                { $eq: ['$userStatus', EventsUsersStatusType.WANT_GO] },
                1,
                0,
              ],
            },
          },
          ticketsPurchased: {
            $sum: {
              $cond: [
                {
                  $eq: ['$userStatus', EventsUsersStatusType.TICKETS_PURCHASED],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    if (!stats) {
      return {
        likes: 0,
        ticketsPurchased: 0,
        wantGo: 0,
      };
    }
    return stats satisfies IEventStats;
  }
  public async getEventsByKeywords(
    userCId: string,
    keywords: string,
  ): Promise<IEventWithUserStats[]> {
    const regex = new RegExp(keywords, 'i');
    return await this.db.models.event.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
          ],
        },
      },
      ...EventsDal.getEventsWithUserStatsAggregation(userCId),
    ]);
  }
  public async getEventsByLocation(
    userCId: string,
    longitude: number,
    latitude: number,
    radius: number,
  ): Promise<IEventWithUserStats[]> {
    return await this.db.models.event.aggregate([
      {
        $match: {
          'location.coordinates': {
            $geoWithin: {
              $centerSphere: [
                [longitude, latitude],
                this.getRadiusInRadians(radius),
              ],
            },
          },
        },
      },
      ...EventsDal.getEventsWithUserStatsAggregation(userCId),
    ]);
  }
  /**
   *
   * @param radius km
   */
  public getRadiusInRadians(radius: number) {
    return radius * RADIANS_PER_KILOMETER;
  }

  public async getCityByEventCoordinates({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }): Promise<ICity | null> {
    return await this.db.models.city.findOne({
      location: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
      },
    });
  }

  /**
   *
   * @description without picture
   */
  public async createUserEvent(
    payload: z.infer<typeof CreateEventSchema>,
    creatorCid: string,
  ) {
    const city = await this.getCityByEventCoordinates({
      lat: payload.location.lat,
      lng: payload.location.lng,
    });
    const createdEvent = await this.db.models.event.create({
      ageLimit: payload.ageLimit,
      creator: {
        creatorCid: creatorCid,
        type: CreatorType.USER,
      } satisfies IEvent['creator'],
      description: payload.description,
      //@todo check if enums are working
      accessibility: payload.accessibility,
      eventType: payload.eventType, // EventType[payload.eventType] ?? EventType.USER,
      title: payload.title,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: {
        cityId: city?.id,
        coordinates: {
          type: 'Point',
          coordinates: [payload.location.lng, payload.location.lat],
        },
        country: 'Israel',
      } as ILocation,
      slug: payload.slug,
      tickets: payload.tickets.map((ticket) => ({
        amount: ticket.amount,
        name: ticket.name,
        price: {
          amount: ticket.price,
          currency: 'ILS',
        },
        description: ticket.description,
      })) as ITicket[],
    } as IEvent);
    return createdEvent;
  }

  public async updatePictureForEvent(
    eventId: string,
    picture: string,
  ): Promise<IEvent> {
    const event = await this.db.models.event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          picture: picture,
        },
      },
      {
        new: true,
      },
    );
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event.toObject();
  }

  public async uploadToPublicEventsAssestsBucket(key: string, file: Buffer) {
    const { url } = await this.s3Service.upload(
      'events-assets/'.concat(key),
      file,
    );
    return url;
  }

  static getEventsWithUserStatsAggregation(userCId: string) {
    return [
      {
        $lookup: {
          from: 'eventsusers',
          localField: '_id',
          foreignField: 'event',
          as: 'userStats',
          pipeline: [
            {
              $match: {
                userCId: userCId,
              },
            },
            {
              $project: {
                _id: 0,
                isUserLike: { $ifNull: ['$isUserLike', false] },
                userStatus: { $ifNull: ['$userStatus', undefined] },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          id: {
            $toString: '$_id',
          },
          userStats: {
            $ifNull: [
              { $arrayElemAt: ['$userStats', 0] },
              {
                isUserLike: false,
                userStatus: undefined,
              },
            ],
          },
        } satisfies Partial<Record<keyof IEventWithUserStats, any>>,
      },
    ];
  }
}
