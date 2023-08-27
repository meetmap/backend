import { EventsServiceDatabase } from '@app/database';
import { AppDto } from '@app/dto';
import { GeocodingService } from '@app/geocoding';
import { AppTypes } from '@app/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
import { EventsDal } from '../events/events.dal';

@Injectable()
export class EventsProcessingDal {
  constructor(
    private readonly db: EventsServiceDatabase,
    private readonly geocoder: GeocodingService,
  ) {}

  public async initUserEventUpload(
    userCid: string,
    payload: AppDto.EventsServiceDto.EventProcessing.CreateUserEventRequestDto,
  ): Promise<{
    upload: AppTypes.EventsService.EventProcessing.EventProcessing;
    transport: AppDto.TransportDto.Events.CreateEventPayload;
  }> {
    const tags = await this.getDbTags(payload.tagsCids);

    const uploadCid = randomUUID();
    const eventCid = randomUUID();
    const transportEvent = AppDto.TransportDto.Events.CreateEventPayload.create(
      {
        cid: eventCid,
        slug: eventCid,
        accessibility: payload.accessibility,
        ageLimit: payload.ageLimit,
        endTime: payload.endTime,
        location: payload.location,
        startTime: payload.startTime,
        tagsCids: tags.map((tag) => tag.cid),
        tickets: payload.tickets,
        eventType: AppTypes.EventsService.Event.EventType.USER,
        title: payload.title,
        creator: {
          creatorCid: userCid,
          type: AppTypes.EventsService.Event.CreatorType.USER,
        },
        description: payload.description,
        processingCid: uploadCid,
      },
    );

    const upload = await this.db.models.eventProcessing.create({
      cid: uploadCid,
      creator: {
        creatorCid: userCid,
        type: AppTypes.EventsService.Event.CreatorType.USER,
      },
      rawEvent: JSON.stringify(transportEvent),
      eventCid: eventCid,
      type: AppTypes.EventsService.EventProcessing.ProcessingType
        .USER_EVENT_CREATE,
      status:
        AppTypes.EventsService.EventProcessing.ProcessingStatus.INITIALIZED,
    });

    return {
      transport: transportEvent,
      upload: upload.toObject(),
    };
  }

  public async initTicketingPlatformEventUpload(
    payload: AppDto.EventsServiceDto.EventProcessing.CreateTicketingPlatformEventRequestDto,
    platformCid?: string,
  ): Promise<{
    upload: AppTypes.EventsService.EventProcessing.EventProcessing;
    transport: AppDto.TransportDto.Events.CreateEventPayload;
  }> {
    const tags = await this.getDbTags(payload.tagsCids);

    const uploadCid = randomUUID();
    const eventCid = randomUUID();
    const transportEvent = AppDto.TransportDto.Events.CreateEventPayload.create(
      {
        cid: eventCid,
        slug: payload.slug,
        accessibility: payload.accessibility,
        ageLimit: payload.ageLimit,
        endTime: payload.endTime,
        location: payload.location,
        startTime: payload.startTime,
        tagsCids: tags.map((tag) => tag.cid),
        tickets: payload.tickets,
        title: payload.title,
        eventType: AppTypes.EventsService.Event.EventType.PARTNER,
        creator: platformCid
          ? {
              creatorCid: platformCid,
              type: AppTypes.EventsService.Event.CreatorType
                .TICKETING_PLATFOFRM,
            }
          : undefined,
        description: payload.description,
        processingCid: uploadCid,
        link: payload.link,
        assetsUrls: payload.assetsUrls,
      },
    );

    const upload = await this.db.models.eventProcessing.create({
      cid: uploadCid,
      creator: platformCid
        ? {
            creatorCid: platformCid,
            type: AppTypes.EventsService.Event.CreatorType.TICKETING_PLATFOFRM,
          }
        : undefined,
      rawEvent: JSON.stringify(transportEvent),
      eventCid: eventCid,
      type: platformCid
        ? AppTypes.EventsService.EventProcessing.ProcessingType
            .THIRD_PARTY_EVENT_CREATE
        : AppTypes.EventsService.EventProcessing.ProcessingType
            .THIRD_PARTY_SYSTEM_EVENT_CREATE,
      status:
        AppTypes.EventsService.EventProcessing.ProcessingStatus.INITIALIZED,
    });

    return {
      transport: transportEvent,
      upload: upload.toObject(),
    };
  }

  public async initUserEventUpdate(
    userCid: string,
    payload: AppDto.EventsServiceDto.EventProcessing.UpdateUserEventRequestDto,
  ): Promise<{
    processing: AppTypes.EventsService.EventProcessing.EventProcessing;
    transport: AppDto.TransportDto.Events.UpdateEventPayload;
  }> {
    const tags = payload.tagsCids
      ? await this.getDbTags(payload.tagsCids)
      : undefined;

    const processingCid = randomUUID();
    const transportEvent = AppDto.TransportDto.Events.UpdateEventPayload.create(
      {
        cid: payload.cid,
        accessibility: payload.accessibility,
        ageLimit: payload.ageLimit,
        endTime: payload.endTime,
        location: payload.location,
        startTime: payload.startTime,
        tagsCids: tags ? tags.map((tag) => tag.cid) : undefined,
        tickets: payload.tickets,
        title: payload.title,
        // creator: {
        //   creatorCid: userCid,
        //   type: AppTypes.EventsService.Event.CreatorType.USER,
        // },
        description: payload.description,
        processingCid: processingCid,
      },
    );

    const processing = await this.db.models.eventProcessing.create({
      cid: processingCid,
      creator: {
        creatorCid: userCid,
        type: AppTypes.EventsService.Event.CreatorType.USER,
      },
      eventCid: payload.cid,
      type: AppTypes.EventsService.EventProcessing.ProcessingType
        .USER_EVENT_UPDATE,
      rawEvent: JSON.stringify(transportEvent),
      status:
        AppTypes.EventsService.EventProcessing.ProcessingStatus.INITIALIZED,
    });

    return {
      transport: transportEvent,
      processing: processing.toObject(),
    };
  }

  public async initTicketingPlatformEventUpdate(
    payload: AppDto.EventsServiceDto.EventProcessing.UpdateTicketingPlatformEventRequestDto,
    platformCid?: string,
  ): Promise<{
    processing: AppTypes.EventsService.EventProcessing.EventProcessing;
    transport: AppDto.TransportDto.Events.UpdateEventPayload;
  }> {
    const tags = payload.tagsCids
      ? await this.getDbTags(payload.tagsCids)
      : undefined;

    const processingCid = randomUUID();
    const transportEvent = AppDto.TransportDto.Events.UpdateEventPayload.create(
      {
        cid: payload.cid,
        accessibility: payload.accessibility,
        ageLimit: payload.ageLimit,
        endTime: payload.endTime,
        location: payload.location,
        startTime: payload.startTime,
        tagsCids: tags ? tags.map((tag) => tag.cid) : undefined,
        tickets: payload.tickets,
        title: payload.title,
        // creator: platformCid
        //   ? {
        //       creatorCid: platformCid,
        //       type: AppTypes.EventsService.Event.CreatorType
        //         .TICKETING_PLATFOFRM,
        //     }
        //   : undefined,
        description: payload.description,
        processingCid: processingCid,
        link: payload.link,
      },
    );

    const processing = await this.db.models.eventProcessing.create({
      cid: processingCid,
      creator: platformCid
        ? {
            creatorCid: platformCid,
            type: AppTypes.EventsService.Event.CreatorType.TICKETING_PLATFOFRM,
          }
        : undefined,
      eventCid: payload.cid,
      type: platformCid
        ? AppTypes.EventsService.EventProcessing.ProcessingType
            .THIRD_PARTY_EVENT_UPDATE
        : AppTypes.EventsService.EventProcessing.ProcessingType
            .THIRD_PARTY_SYSTEM_EVENT_UPDATE,
      rawEvent: JSON.stringify(transportEvent),
      status:
        AppTypes.EventsService.EventProcessing.ProcessingStatus.INITIALIZED,
    });

    return {
      transport: transportEvent,
      processing: processing.toObject(),
    };
  }

  public async createEvent(
    payload: AppDto.TransportDto.Events.CreateEventPayload,
  ): Promise<AppTypes.EventsService.Event.IEvent> {
    const locality = await this.lookupLocalityByCoordinates({
      lat: payload.location.lat,
      lng: payload.location.lng,
    });
    // const cid = randomUUID();
    const createdEvent = await this.db.models.event.create({
      ageLimit: payload.ageLimit,
      creator: payload.creator,
      description: payload.description ?? undefined,
      assets: [],
      //@todo check if enums are working
      accessibility: payload.accessibility,
      eventType: payload.eventType, // EventType[payload.eventType] ?? EventType.USER,
      title: payload.title,
      startTime: payload.startTime,
      endTime: payload.endTime,
      link: payload.link,
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
      cid: payload.cid,
      slug: payload.slug,
      tagsCids: payload.tagsCids.slice(0, 15),
      tickets: payload.tickets.map((ticket) => ({
        amount: ticket.amount,
        name: ticket.name,
        price: {
          amount: ticket.price,
          currency: locality.currency ?? 'USD',
        },
        description: ticket.description,
      })) satisfies AppTypes.EventsService.Event.ITicket[],
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>);

    return createdEvent;
  }

  public async updateEvent(
    payload: AppDto.TransportDto.Events.UpdateEventPayload,
  ): Promise<AppTypes.EventsService.Event.IEvent> {
    const dbEvent = await this.db.models.event
      .findOne({ cid: payload.cid })
      .lean();
    if (!dbEvent) {
      throw new NotFoundException('Event not found');
    }
    let locality = await this.extractLocationFromUpdateEventPayload(
      payload,
      dbEvent,
    );
    if (
      new Date(payload.startTime ?? dbEvent.startTime) >
      new Date(payload.endTime ?? dbEvent.endTime)
    ) {
      throw new BadRequestException("Event start time can't be after end time");
    }

    const updatedEvent = await this.db.models.event.findOneAndUpdate(
      { cid: dbEvent.cid },
      {
        $set: {
          ...(payload.accessibility !== undefined && {
            accessibility: payload.accessibility,
          }),
          ...(payload.ageLimit !== undefined && {
            ageLimit: payload.ageLimit,
          }),
          ...(payload.description !== undefined &&
            (payload.description !== null
              ? { description: payload.description }
              : { description: undefined })),

          ...(payload.endTime !== undefined && {
            endTime: new Date(payload.endTime),
          }),

          ...(payload.startTime !== undefined && {
            endTime: new Date(payload.startTime),
          }),
          ...(payload.link !== undefined && {
            link: payload.link,
          }),
          ...(payload.location && {
            location: {
              coordinates: {
                type: 'Point',
                coordinates: [payload.location.lng, payload.location.lat],
              },
              localityId: locality?.localityId
                ? new mongoose.Types.ObjectId(locality.localityId)
                : undefined,
              countryId: locality?.countryId
                ? new mongoose.Types.ObjectId(locality.countryId)
                : undefined,
            },
          }),
          ...(payload.tagsCids && {
            tagsCids: payload.tagsCids.slice(0, 15),
          }),
          ...(payload.tickets && {
            tickets: payload.tickets.map((ticket) => ({
              amount: ticket.amount,
              name: ticket.name,
              price: {
                amount: ticket.price,
                currency: locality?.currency ?? 'USD',
              },
              description: ticket.description,
            })),
          }),
          ...(payload.title !== undefined && { title: payload.title }),
        } satisfies Partial<
          AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>
        >,
      },
    );
    if (!updatedEvent) {
      throw new NotFoundException(
        "Failed to update event, event doesn't exist",
      );
    }
    return updatedEvent;
  }

  public async updateFailedProcessingStep(
    processingCid: string,
    reason: string,
  ) {
    return await this.db.models.eventProcessing.findOneAndUpdate(
      {
        cid: processingCid,
      },
      {
        $set: {
          status:
            AppTypes.EventsService.EventProcessing.ProcessingStatus.FAILED,
          failureReason: reason,
        },
      },
    );
  }

  public async getUserActiveProcessing(userCid: string) {
    const currentUpload = await this.db.models.eventProcessing.findOne({
      'creator.creatorCid': userCid,
      'creator.type': AppTypes.EventsService.Event.CreatorType.USER,
      status: {
        $nin: [
          AppTypes.EventsService.EventProcessing.ProcessingStatus.SUCCEEDED,
          AppTypes.EventsService.EventProcessing.ProcessingStatus.FAILED,
        ],
      },
    });
    return currentUpload;
  }

  public async getProcessing(processingCid: string) {
    const upload = await this.db.models.eventProcessing.findOne({
      cid: processingCid,
    });
    return upload;
  }

  public getEventsWithoutTagsCursor() {
    return this.db.models.event
      .find({
        tagsCids: { $size: 0 },
      })
      .cursor({
        batchSize: 50,
      });
  }
  public async getEventByCid(cid: string) {
    return await this.db.models.event.findOne({ cid: cid });
  }

  public async getEventByProcessingCid(processingCid: string) {
    const processing = await this.db.models.eventProcessing
      .findOne({
        cid: processingCid,
      })
      .lean();
    return await this.db.models.event.findOne({ cid: processing?.eventCid });
  }

  public async getEventWithUserMetadataAndTags(
    userCid: string,
    eventCid: string,
  ): Promise<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags | null> {
    const [event] =
      await this.db.models.event.aggregate<AppTypes.EventsService.Event.IEventWithUserMetadataAndTags>(
        [
          {
            $match: {
              cid: eventCid,
            },
          },
          ...EventsDal.getEventsWithUserStatsTagsAggregation(userCid),
        ],
      );

    return event ?? null;
  }

  public async getEventsTags() {
    const tags = await this.db.models.eventTags
      .find<Pick<AppTypes.EventsService.EventTags.ITag, 'label'>>({})
      .select('label' satisfies keyof AppTypes.EventsService.EventTags.ITag);
    return tags.map((tag) => tag.label);
  }

  /**
   *
   * @returns maximum is 15 tags
   */
  public async getTagsCids(tags: string[]) {
    const data = await this.db.models.eventTags
      .find<Pick<AppTypes.EventsService.EventTags.ITag, 'cid'>>({
        label: {
          $in: tags,
        },
      })
      .select('cid' satisfies keyof AppTypes.EventsService.EventTags.ITag);

    return data.map((item) => item.cid).slice(0, 15);
  }

  public async assignTagsToEvent(eventCid: string, tagsCids: string[]) {
    return await this.db.models.event.findOneAndUpdate(
      {
        cid: eventCid,
      },
      {
        $set: {
          tagsCids: tagsCids.slice(0, 15),
        },
      },
      {
        new: true,
      },
    );
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
      currency: dbCountry?.currency,
    };
  }

  private async getDbTags(tagsCids: string[]) {
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
    return dbTags;
  }

  private async extractLocationFromUpdateEventPayload(
    payload: AppDto.TransportDto.Events.UpdateEventPayload,
    dbEvent: AppTypes.EventsService.Event.IEvent | null,
  ) {
    try {
      const coordinates = payload.location;
      if (!coordinates) {
        return null;
      }
      const { lat: payloadLat, lng: payloadLng } = coordinates;

      if (dbEvent) {
        const [lng, lat] = dbEvent.location.coordinates.coordinates;
        const country = dbEvent.location.countryId
          ? await this.db.models.country.findById(dbEvent.location.countryId)
          : null;
        if (payloadLng === lng && payloadLat === lat) {
          return {
            countryId: dbEvent.location.countryId?.toString(),
            localityId: dbEvent.location.localityId?.toString(),
            currency: country ? country.currency : undefined,
          };
        }
      }

      const { countryId, localityId, currency } =
        await this.lookupLocalityByCoordinates({
          lat: payloadLat,
          lng: payloadLng,
        });
      return {
        countryId,
        localityId,
        currency,
      };
    } catch (error) {
      console.warn('Error in extractLocationFromEventerResponse');
      return null;
    }
  }

  public async updateProcessingStatus(
    processingCid: string,
    status: AppTypes.EventsService.EventProcessing.ProcessingStatus,
  ) {
    return await this.db.models.eventProcessing.findOneAndUpdate(
      {
        cid: processingCid,
      },
      {
        $set: {
          status,
        },
      },
    );
  }
}
