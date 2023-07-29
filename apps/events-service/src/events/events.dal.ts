import { RADIANS_PER_KILOMETER } from '@app/constants';
import { EventsServiceDatabase } from '@app/database';
import { AppDto } from '@app/dto';
import { S3UploaderService } from '@app/s3-uploader';
import { AppTypes } from '@app/types';

import { Injectable, NotFoundException } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { z } from 'zod';
@Injectable()
export class EventsDal {
  constructor(
    private readonly db: EventsServiceDatabase,
    private readonly s3Service: S3UploaderService,
  ) {}

  public async getEventById(
    eventId: string,
  ): Promise<AppTypes.EventsService.Event.IEvent | null> {
    const event = await this.db.models.event.findById(eventId);
    if (!event) {
      return null;
    }
    return event.toObject();
  }

  public async getUsersLikedAnEvent(eventId: string) {
    return await this.db.models.eventsUsers.aggregate<AppTypes.EventsService.Users.IUser>(
      [
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
      ],
    );
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
            action === 'want-go'
              ? AppTypes.EventsService.EventsUsers.EventsUsersStatusType.WANT_GO
              : undefined,
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
  ): Promise<AppTypes.EventsService.Event.IEventWithUserStats['userStats']> {
    const stats = await this.db.models.eventsUsers.findOne({
      event: new mongoose.Types.ObjectId(eventId),
      userCId,
    });

    return {
      isUserLike: !!stats?.isUserLike,
      userStatus: stats?.userStatus,
    };
  }

  public async getEventStats(
    eventId: string,
  ): Promise<AppTypes.EventsService.Event.IEventStats> {
    const [stats] =
      await this.db.models.eventsUsers.aggregate<AppTypes.EventsService.Event.IEventStats>(
        [
          {
            $match: {
              event: new mongoose.Types.ObjectId(eventId),
            },
          },
          {
            $group: {
              _id: null,
              likes: {
                $sum: { $cond: [{ $eq: ['$isUserLike', true] }, 1, 0] },
              },
              wantGo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        '$userStatus',
                        AppTypes.EventsService.EventsUsers.EventsUsersStatusType
                          .WANT_GO,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              ticketsPurchased: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        '$userStatus',
                        AppTypes.EventsService.EventsUsers.EventsUsersStatusType
                          .TICKETS_PURCHASED,
                      ],
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
        ],
      );

    if (!stats) {
      return {
        likes: 0,
        ticketsPurchased: 0,
        wantGo: 0,
      };
    }
    return stats satisfies AppTypes.EventsService.Event.IEventStats;
  }
  public async getEventsByKeywords(
    userCId: string,
    keywords: string,
  ): Promise<AppTypes.EventsService.Event.IEventWithUserStats[]> {
    const regex = new RegExp(keywords, 'i');
    return await this.db.models.event.aggregate([
      {
        $match: {
          $text: { $search: keywords },
        },
      },
      {
        $sort: { score: { $meta: 'textScore' } },
      },
      {
        $limit: 15,
      },
      ...EventsDal.getEventsWithUserStatsAggregation(userCId),
    ]);
  }

  public async getEventsBatch(
    userCId: string,
    eventIds: string[],
  ): Promise<AppTypes.EventsService.Event.IEventWithUserStats[]> {
    return await this.db.models.event.aggregate([
      {
        $match: {
          _id: {
            $in: eventIds.map(
              (eventId) => new mongoose.Types.ObjectId(eventId),
            ),
          },
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
  ): Promise<AppTypes.EventsService.Event.IMinimalEventByLocation[]> {
    return await this.db.models.event.aggregate<AppTypes.EventsService.Event.IMinimalEventByLocation>(
      [
        {
          $match: {
            endTime: {
              //exclude events that ended more than a day ago
              $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            },
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
        {
          $project: {
            picture: 1,
            coordinates: '$location.coordinates.coordinates',
            id: {
              $toString: '$_id',
            },
            _id: 0,
          },
        },
        // ...EventsDal.getEventsWithUserStatsAggregation(userCId),
      ],
    );
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
  }): Promise<AppTypes.Shared.City.ICity | null> {
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
    payload: z.infer<
      typeof AppDto.EventsServiceDto.EventsDto.CreateEventSchema
    >,
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
        type: AppTypes.EventsService.Event.CreatorType.USER,
      } satisfies AppTypes.EventsService.Event.IEvent['creator'],
      description: payload.description ?? undefined,
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
      } as AppTypes.Shared.Location.ILocation,
      slug: payload.slug,
      tickets: payload.tickets.map((ticket) => ({
        amount: ticket.amount,
        name: ticket.name,
        price: {
          amount: ticket.price,
          currency: 'ILS',
        },
        description: ticket.description,
      })) as AppTypes.EventsService.Event.ITicket[],
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>);
    return createdEvent;
  }

  public async updatePictureForEvent(
    eventId: string,
    picture: string,
  ): Promise<AppTypes.EventsService.Event.IEvent> {
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
        } satisfies Partial<
          Record<keyof AppTypes.EventsService.Event.IEventWithUserStats, any>
        >,
      },
    ];
  }
}
