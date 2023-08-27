import { getMinEventEndDate, RADIANS_PER_KILOMETER } from '@app/constants';
import { EventsServiceDatabase } from '@app/database';
import { getPaginatedResultAggregation } from '@app/database/shared-aggregations';
import { AppDto } from '@app/dto';
import { GeocodingService } from '@app/geocoding';
import { SearchService } from '@app/search';
import { AppTypes } from '@app/types';

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
@Injectable()
export class EventsDal {
  constructor(
    private readonly db: EventsServiceDatabase,
    private readonly searchService: SearchService,
    private readonly geocoder: GeocodingService,
  ) {}

  // public async createUserEventUpload(
  //   userCid: string,
  //   payload: AppDto.EventsServiceDto.EventsDto.CreateUserEventRequestDto,
  // ): Promise<{
  //   upload: AppTypes.EventsService.EventUpload.EventProcessing;
  //   transport: AppDto.TransportDto.Events.CreateEventPayload;
  // }> {
  //   const tags = await this.db.models.eventTags
  //     .find<Pick<AppTypes.EventsService.EventTags.ITag, 'cid' | 'label'>>({
  //       cid: {
  //         $in: payload.tagsCids,
  //       },
  //     })
  //     //max 15 tags
  //     .limit(15)
  //     .select('cid' satisfies keyof AppTypes.EventsService.EventTags.ITag)
  //     .select('label' satisfies keyof AppTypes.EventsService.EventTags.ITag);
  //   const dbTags = tags.map((tag) => ({
  //     cid: tag.cid,
  //     label: tag.label,
  //   }));

  //   const transportEvent = AppDto.TransportDto.Events.CreateEventPayload.create(
  //     {
  //       accessibility: payload.accessibility,
  //       ageLimit: payload.ageLimit,
  //       endTime: payload.endTime,
  //       location: payload.location,
  //       startTime: payload.startTime,
  //       tagsCids: dbTags.map((tag) => tag.cid),
  //       tickets: payload.tickets,
  //       title: payload.title,
  //       creator: {
  //         creatorCid: userCid,
  //         type: AppTypes.EventsService.Event.CreatorType.USER,
  //       },
  //       description: payload.description,
  //     },
  //   );

  //   const upload = await this.db.models.eventProcessing.create({
  //     cid: randomUUID(),
  //     creator: {
  //       creatorCid: userCid,
  //       type: AppTypes.EventsService.Event.CreatorType.USER,
  //     },
  //     rawEvent: JSON.stringify(transportEvent),
  //     status: AppTypes.EventsService.EventUpload.ProcessingStatus.INITIALIZED,
  //   });

  //   return {
  //     transport: transportEvent,
  //     upload,
  //   };
  // }

  public async getEventWithUserMetadataAndTags(
    userCid: string,
    eventCid: string,
  ): Promise<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags | null> {
    const {
      paginatedResults: [event],
    } = await this.getEventsWithUserMetadataAndTags(userCid, [eventCid]);

    return event ?? null;
  }

  public async getEventByCid(
    eventCid: string,
  ): Promise<AppTypes.EventsService.Event.IEventWithLocation | null> {
    const event = await this.db.models.event
      .findOne({ cid: eventCid })
      .populate<{
        location: {
          countryId: AppTypes.Shared.Country.ICountry;
          localityId?: AppTypes.Shared.Locality.ILocality;
          coordinates: AppTypes.EventsService.Event.IEvent['location']['coordinates'];
        };
      }>({
        path: 'location.localityId location.countryId',
        select: '-location',
      })
      .lean();
    if (!event) {
      return null;
    }
    return {
      ...event,
      location: {
        countryId: event.location.countryId.id,
        localityId: event.location.localityId?.id,
        country: event.location.countryId.en_name,
        locality: event.location.localityId?.en_name,
        coordinates: event.location.coordinates,
      },
    };
  }

  public async getMLTEvents(
    userCid: string,
    eventCid: string,
    page: number = 1,
  ): Promise<
    AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>
  > {
    const pageSize = 15;
    const startFrom = (page - 1) * pageSize;
    const res = await this.searchService.indexes.events.search({
      body: {
        from: startFrom,
        size: pageSize,
        query: {
          bool: {
            must: {
              bool: {
                should: [
                  {
                    more_like_this: {
                      fields: ['description', 'title'],
                      like: {
                        _index: 'events',
                        _id: eventCid,
                      },
                      min_term_freq: 1,
                      max_query_terms: 20,
                      boost: 2.5,
                    },
                  },
                  {
                    nested: {
                      path: 'tags',
                      query: {
                        more_like_this: {
                          fields: ['tags.label'],
                          like: {
                            _index: 'events',
                            _id: eventCid,
                          },
                          min_term_freq: 1,
                          max_query_terms: 10,
                        },
                      },
                    },
                  },
                ],
              },
            },
            filter: {
              range: {
                endTime: {
                  gte: getMinEventEndDate().toISOString(), // Replace with your input date
                },
              },
            },
          },
        },
      },
    });
    const foundAmount = res.hits.hits.length;

    const totalCount = res.hits.total.value;
    const matchedCids = res.hits.hits.map((hit) => hit._source.cid);
    const events = await this.getEventsBatch(userCid, matchedCids);
    // console.log(hits);
    return {
      totalCount: totalCount,
      paginatedResults: events,
      nextPage: startFrom + foundAmount < totalCount ? page + 1 : undefined,
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
    minDate: Date = getMinEventEndDate(),
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
    userCid: string,
    eventCids: string[],
    distinct: boolean = false,
  ): Promise<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags[]> {
    return await this.db.models.event.aggregate<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>(
      [
        {
          $match: {
            cid: { $in: distinct ? [...new Set(eventCids)] : eventCids },
          } satisfies Partial<
            Record<keyof AppTypes.EventsService.Event.IEvent, any>
          >,
        },
        ...EventsDal.getEventsWithUserStatsTagsAggregation(userCid),
      ],
    );
  }

  public async getEventsBatchPaginated(
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
              $gte: getMinEventEndDate(),
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

  public async lookupLocalityByCoordinates({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }) {
    const locality = await this.geocoder.reverseLocality({ lat, lng });
    let dbCountry = await this.db.models.country
      .findOne({
        en_name: locality.country?.en_name,
      })
      .lean();

    if (!dbCountry) {
      const country = await this.geocoder.reverseCountry({ lat, lng });
      if (country) {
        dbCountry = await this.db.models.country.create({
          en_name: country.en_name,
          coordinates: {
            coordinates: [country.coordinates.lng, country.coordinates.lat],
            type: 'Point',
          } satisfies AppTypes.Shared.Country.ICountry['coordinates'],
          google_place_id: country.place_id,
        });
      }
    }
    let dbLocality = await this.db.models.locality
      .findOne({
        en_name: locality.locality?.en_name,
        countryId: dbCountry?._id,
      })
      .lean();
    if (!dbLocality) {
      if (locality.locality) {
        dbLocality = await this.db.models.locality.create({
          en_name: locality.locality.en_name,
          coordinates: (locality.coordinates
            ? {
                coordinates: [
                  locality.coordinates.lng,
                  locality.coordinates.lat,
                ],
                type: 'Point',
              }
            : undefined) satisfies
            | AppTypes.Shared.Country.ICountry['coordinates']
            | undefined,
          google_place_id: locality.place_id,
          countryId: dbCountry?._id,
        });
      }
    }

    return {
      countryId: dbCountry?._id.toString(),
      localityId: dbLocality?._id.toString(),
      localityName: dbLocality?.en_name,
      countryName: dbCountry?.en_name,
    };
  }

  /**
   *
   * @description without picture
   */
  public async createUserEvent(
    creatorCid: string,
    payload: AppDto.EventsServiceDto.EventsDto.CreateUserEventRequestDto,
    tagsCids: string[],
  ): Promise<{
    tags: AppTypes.EventsService.EventTags.ISafeTag[];
    event: AppTypes.EventsService.Event.IEvent;
    location: AppTypes.Shared.Location.IEntityLocationPopulated;
  }> {
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
    const locality = await this.lookupLocalityByCoordinates({
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
      accessibility: payload.accessibility,
      eventType: AppTypes.EventsService.Event.EventType.USER, // EventType[payload.eventType] ?? EventType.USER,
      title: payload.title,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: {
        localityId: locality.localityId
          ? new mongoose.Types.ObjectId(locality.localityId)
          : undefined,
        coordinates: {
          type: 'Point',
          coordinates: [payload.location.lng, payload.location.lat],
        },
        countryId: locality.countryId
          ? new mongoose.Types.ObjectId(locality.countryId)
          : undefined,
      } satisfies AppTypes.Shared.Location.IEntityLocation,
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
      location: {
        coordinates: createdEvent.location.coordinates,
        country: locality.countryName,
        countryId: locality.countryId,
        locality: locality.localityName,
        localityId: locality.localityId,
      },
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

  static getEventsWithPopulatedLocationAggregation(): mongoose.PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'countries',
          localField: 'location.countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'localities',
          localField: 'location.localityId',
          foreignField: '_id',
          as: 'locality',
        },
      },
      {
        $unwind: {
          path: '$locality',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          location: {
            coordinates: '$location.coordinates',
            country: '$country.en_name',
            countryId: '$country._id',
            locality: '$locality.en_name',
            localityId: '$locality._id',
          } satisfies Record<
            keyof AppTypes.Shared.Location.IEntityLocationPopulated,
            any
          >,
        } satisfies Partial<
          Record<
            keyof AppTypes.EventsService.Event.IEventWithUserMetadataAndTags,
            any
          >
        >,
      },
      { $unset: ['country', 'locality'] },
    ];
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
      ...EventsDal.getEventsWithPopulatedLocationAggregation(),
    ];
  }
}
