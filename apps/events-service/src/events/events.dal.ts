import { RADIANS_PER_KILOMETER } from '@app/constants';
import { EventsServiceDatabase } from '@app/database';
import { getPaginatedResultAggregation } from '@app/database/shared-aggregations';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
@Injectable()
export class EventsDal {
  constructor(private readonly db: EventsServiceDatabase) {}

  public async getEventWithUserMetadataAndTags(
    userCid: string,
    eventCid: string,
  ): Promise<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags | null> {
    const {
      paginatedResults: [event],
    } = await this.getEventsWithUserMetadataAndTags(userCid, [eventCid]);

    return event ?? null;
  }

  public async getEventByCid(eventCid: string): Promise<
    | (AppTypes.EventsService.Event.IEvent & {
        location: AppTypes.Shared.Location.ILocationWithCity;
      })
    | null
  > {
    const event = await this.db.models.event
      .findOne({ cid: eventCid })
      .populate({
        path: 'location.cityId',
        select: '-location',
      });
    if (!event) {
      return null;
    }
    const objectEvent = event.toObject();
    return {
      ...objectEvent,
      location: {
        city: objectEvent.location.cityId as unknown as Omit<
          AppTypes.Shared.City.ICity,
          'location'
        >,
        coordinates: objectEvent.location.coordinates,
        country: objectEvent.location.country,
      },
    };
  }

  public async getUsersLikedAnEvent(eventCid: string, page: number = 1) {
    const pageSize = 15;
    const [result] = await this.db.models.eventsUsers.aggregate<
      AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.Users.IUser>
    >([
      {
        $match: {
          isUserLike: true,
          eventCid: eventCid,
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
      ...getPaginatedResultAggregation(page, pageSize),
    ]);

    return result;
  }

  public async userAction(
    userCId: string,
    eventCid: string,
    action: 'like' | 'want-go',
  ) {
    const response = await this.db.models.eventsUsers.findOneAndUpdate(
      {
        userCId,
        eventCid: eventCid,
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
    eventCid: string,
    action: 'like' | 'want-go',
  ) {
    const response = await this.db.models.eventsUsers.findOneAndUpdate(
      {
        userCId,
        eventCid: eventCid,
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

  public async getEventStats(
    eventCid: string,
  ): Promise<AppTypes.EventsService.Event.IEventStats> {
    const [stats] =
      await this.db.models.eventsUsers.aggregate<AppTypes.EventsService.Event.IEventStats>(
        [
          {
            $match: {
              eventCid: eventCid,
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

  public async getAllTagsWithMetadata(page: number = 1) {
    const pageSize = 15;
    const [result] = await this.db.models.eventTags.aggregate<
      AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.EventTags.ISafeTagWithMetadata>
    >([
      {
        $project: {
          cid: 1,
          label: 1,
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      ...getPaginatedResultAggregation(page, pageSize),
    ]);

    return result;
  }

  public async getTagsByKeywordsWithMetadata(
    keywords: string,
    page: number = 1,
  ) {
    const pageSize = 15;

    const [matchingTags] = await this.db.models.eventTags.aggregate<
      AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.EventTags.ISafeTagWithMetadata>
    >([
      {
        $match: {
          $text: {
            $search: keywords,
          },
        },
      },
      {
        $project: {
          _id: false,
          cid: 1,
          label: 1,
          count: 1,
        } satisfies Record<
          keyof AppTypes.EventsService.EventTags.ISafeTagWithMetadata | '_id',
          boolean | number
        >,
      },
      {
        $sort: {
          score: { $meta: 'textScore' },
          count: -1,
        },
      },
      ...getPaginatedResultAggregation(page, pageSize),
    ]);
    return matchingTags;
  }

  public async getEventsByKeywords(
    userCId: string,
    keywords: string,
    page: number = 1,
    tagsCids: string[],
    minPrice: number,
    maxPrice: number,
    minDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
    //1 day before
    maxDate?: Date,
    searchByCoordinates?: {
      radius: number;
      lat: number;
      lng: number;
    },
  ): Promise<
    AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>
  > {
    const pageSize = 15;
    const [matchingEventsCids] = await this.db.models.event.aggregate<
      AppTypes.Other.PaginatedResponse.IPaginatedResponse<
        Pick<AppTypes.EventsService.Event.IEvent, 'cid'>
      >
    >([
      {
        $match: {
          $text: {
            $search: keywords,
          },
          ...(tagsCids.length > 0 && {
            tagsCids: {
              $in: tagsCids,
            },
          }),
          $or: [
            { tickets: { $size: 0 } },
            {
              tickets: {
                $elemMatch: {
                  'price.amount': {
                    $gte: minPrice,
                    ...(Number.isFinite(maxPrice) && {
                      $lte: maxPrice,
                    }),
                  },
                },
              },
            },
          ],
          ...(!!minDate && {
            endTime: {
              $gte: minDate,
            },
          }),
          ...(!!maxDate && {
            startTime: {
              $lte: maxDate,
            },
          }),
          ...(!!searchByCoordinates &&
            Number.isFinite(searchByCoordinates.radius) && {
              'location.coordinates': {
                $geoWithin: {
                  $centerSphere: [
                    [searchByCoordinates.lng, searchByCoordinates.lat],
                    this.getRadiusInRadians(searchByCoordinates.radius),
                  ],
                },
              },
            }),
        } satisfies mongoose.FilterQuery<AppTypes.EventsService.Event.IEvent>,
      },
      {
        $project: {
          cid: 1,
          _id: -1,
        } satisfies Partial<
          Record<keyof AppTypes.EventsService.Event.IEvent | '_id', number>
        >,
      },
      {
        $sort: {
          score: {
            $meta: 'textScore',
          },
        },
      },
      ...getPaginatedResultAggregation(page, pageSize),
    ]);

    const eventCids = matchingEventsCids.paginatedResults.map(
      (event) => event.cid,
    );
    const eventsWithMetadata = await this.getEventsWithUserMetadataAndTags(
      userCId,
      eventCids,
    );

    return {
      paginatedResults: eventsWithMetadata.paginatedResults,
      totalCount: matchingEventsCids.totalCount,
      nextPage: matchingEventsCids.nextPage ?? undefined,
    };
  }

  public async getEventsBatch(
    userCId: string,
    eventCIds: string[],
    page: number = 1,
  ): Promise<
    AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>
  > {
    return await this.getEventsWithUserMetadataAndTags(
      userCId,
      eventCIds,
      page,
    );
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
            thumbnail: { $arrayElemAt: ['$assets', 0] },
            cid: 1,
            coordinates: '$location.coordinates.coordinates',
            id: {
              $toString: '$_id',
            },
            _id: 0,
            isThirdParty: {
              $toBool: '$creator',
            },
          } satisfies Record<
            keyof AppTypes.EventsService.Event.IMinimalEventByLocation | '_id',
            any
          >,
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
    creatorCid: string,
    payload: AppDto.EventsServiceDto.EventsDto.CreateUserEventRequestDto,
    tagsCids: string[],
  ) {
    const tags = await this.db.models.eventTags
      .find<Pick<AppTypes.EventsService.EventTags.ITag, 'cid' | 'label'>>({
        cid: {
          $in: tagsCids,
        },
      })
      //max 15 tags
      .limit(15)
      .select('cid' satisfies keyof AppTypes.EventsService.EventTags.ITag)
      .select('label' satisfies keyof AppTypes.EventsService.EventTags.ITag);
    const dbTags = tags.map((tag) => ({
      cid: tag.cid,
      label: tag.label,
    }));
    const city = await this.getCityByEventCoordinates({
      lat: payload.location.lat,
      lng: payload.location.lng,
    });
    const cid = randomUUID();
    const createdEvent = await this.db.models.event.create({
      ageLimit: payload.ageLimit,
      creator: {
        creatorCid: creatorCid,
        type: AppTypes.EventsService.Event.CreatorType.USER,
      } satisfies AppTypes.EventsService.Event.IEvent['creator'],
      description: payload.description ?? undefined,
      assets: [],
      //@todo check if enums are working
      accessibility: payload.accessibility,
      eventType: AppTypes.EventsService.Event.EventType.USER, // EventType[payload.eventType] ?? EventType.USER,
      title: payload.title,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: {
        cityId: city ? new mongoose.Types.ObjectId(city.id) : undefined,
        coordinates: {
          type: 'Point',
          coordinates: [payload.location.lng, payload.location.lat],
        },
        country: 'Israel',
      } satisfies AppTypes.Shared.Location.ILocation,
      cid: cid,
      slug: cid,
      tagsCids: dbTags.map((tag) => tag.cid),
      tickets: payload.tickets.map((ticket) => ({
        amount: ticket.amount,
        name: ticket.name,
        price: {
          amount: ticket.price,
          currency: 'ILS',
        },
        description: ticket.description,
      })) satisfies AppTypes.EventsService.Event.ITicket[],
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>);
    return {
      event: createdEvent.toObject(),
      tags: dbTags,
    };
  }

  public async updatePicturesForEvent(
    eventCid: string,
    keys: string[],
  ): Promise<AppTypes.EventsService.Event.IEvent> {
    const event = await this.db.models.event.findOneAndUpdate(
      {
        cid: eventCid,
      },
      {
        $push: {
          assets: {
            $each: keys,
          },
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

  public async getEventsWithUserMetadataAndTags(
    userCid: string,
    eventsCids: string[],
    page: number = 1,
  ) {
    const pageSize = 15;
    const [result] = await this.db.models.event.aggregate<
      AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>
    >([
      {
        $match: {
          cid: { $in: eventsCids },
        } satisfies Partial<
          Record<keyof AppTypes.EventsService.Event.IEvent, any>
        >,
      },
      ...EventsDal.getEventsWithUserStatsTagsAggregation(userCid),
      ...getPaginatedResultAggregation(page, pageSize),
    ]);
    return result;
  }

  static getEventsWithUserStatsTagsAggregation(
    userCId: string,
  ): mongoose.PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'eventsusers',
          localField: 'cid',
          foreignField: 'eventCid',
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
        $lookup: {
          from: 'eventtags',
          localField: 'tagsCids',
          foreignField: 'cid',
          as: 'tags',
          pipeline: [
            {
              $project: {
                label: true,
                cid: true,
                _id: false,
              } satisfies Record<
                keyof AppTypes.EventsService.EventTags.ISafeTag | '_id',
                boolean
              >,
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
          thumbnail: { $arrayElemAt: ['$assets', 0] },
        } satisfies Partial<
          Record<
            keyof AppTypes.EventsService.Event.IEventWithUserMetadataAndTags,
            any
          >
        >,
      },
    ];
  }
}
