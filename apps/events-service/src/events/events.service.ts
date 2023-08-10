import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EventsDal } from './events.dal';

@Injectable()
export class EventsService {
  constructor(
    private readonly dal: EventsDal,

    private readonly rmqService: RabbitmqService,
  ) {}

  public async updateEventsPicture(eventCid: string, keys: string[]) {
    await this.dal.updatePicturesForEvent(eventCid, keys);
  }

  public async getEventsByKeywords(userCId: string, keywords: string) {
    const events = await this.dal.getEventsByKeywords(userCId, keywords);
    return events.map(EventsService.mapDbEventToEventResponse);
  }

  public async getEventByCid(
    cid: string,
    eventCid: string,
  ): Promise<AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto> {
    const event = await this.dal.getEventByCid(eventCid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const eventWithUserStatsTags =
      await this.dal.getEventWithUserMetadataAndTags(cid, event.cid);
    if (!eventWithUserStatsTags) {
      throw new NotFoundException('Event not found');
    }

    const eventStats = await this.dal.getEventStats(eventCid);
    // const userStats = await this.dal.getEventUserStats(eventId, cid);
    return EventsService.mapDbEventToSingleEventResponse(
      event,
      event.location.city,
      eventStats,
      eventWithUserStatsTags.userStats,
      eventWithUserStatsTags.tags,
    );
  }

  public async userAction(
    userCId: string,
    eventCid: string,
    type: 'like' | 'want-go',
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const event = await this.dal.getEventByCid(eventCid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.dal.userAction(userCId, eventCid, type);
    const stats = await this.dal.getEventStats(eventCid);
    return AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto.create({
      likes: stats.likes,
      ticketsPurchased: stats.ticketsPurchased,
      wantGo: stats.wantGo,
    });
  }

  public async getEventLikes(eventCid: string) {
    const users = await this.dal.getUsersLikedAnEvent(eventCid);
    return users.map(UsersService.mapEventsUserToUserResponseDto);
  }
  public async cancelUserAction(
    userCId: string,
    eventCid: string,
    type: 'like' | 'want-go',
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const event = await this.dal.getEventByCid(eventCid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.dal.cancelUserAction(userCId, eventCid, type);
    const stats = await this.dal.getEventStats(eventCid);
    return stats;
  }

  public async getEventsByLocation(
    userCId: string,
    dto: AppDto.EventsServiceDto.EventsDto.GetEventsByLocationRequestDto,
  ): Promise<
    AppDto.EventsServiceDto.EventsDto.MinimalEventByLocationResponseDto[]
  > {
    const { latitude, longitude, radius } = dto;
    const events = await this.dal.getEventsByLocation(
      userCId,
      longitude,
      latitude,
      radius,
    );
    return events.map((event) =>
      AppDto.EventsServiceDto.EventsDto.MinimalEventByLocationResponseDto.create(
        {
          coordinates: event.coordinates,
          id: event.id,
          thumbnail:
            event.thumbnail &&
            (event.isThirdParty
              ? AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
                  event.thumbnail,
                  AppTypes.AssetsSerivce.Other.SizeName.XS,
                )
              : event.thumbnail),
        },
      ),
    );
  }

  public async searchTags(
    query: string,
  ): Promise<
    AppDto.EventsServiceDto.EventsDto.EventTagWithMetadataResponseDto[]
  > {
    const tagsWithMetadata = await this.dal.getTagsByKeywordsWithMetadata(
      query,
    );

    return tagsWithMetadata.map((tag) =>
      AppDto.EventsServiceDto.EventsDto.EventTagWithMetadataResponseDto.create({
        cid: tag.cid,
        count: tag.count,
        label: tag.label,
      }),
    );
  }

  public async getAllTags(): Promise<
    AppDto.EventsServiceDto.EventsDto.EventTagWithMetadataResponseDto[]
  > {
    const tagsWithMetadata = await this.dal.getAllTagsWithMetadata();

    return tagsWithMetadata.map((tag) =>
      AppDto.EventsServiceDto.EventsDto.EventTagWithMetadataResponseDto.create({
        cid: tag.cid,
        count: tag.count,
        label: tag.label,
      }),
    );
  }

  public async getEventsBatch(
    userCId: string,
    eventIds: string[],
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto[]> {
    const events = await this.dal.getEventsBatch(userCId, eventIds);
    return events.map(EventsService.mapDbEventToEventResponse);
  }

  public async createUserEvent(
    userCid: string,
    payload: AppDto.EventsServiceDto.EventsDto.CreateUserEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto> {
    const { event, tags } = await this.dal.createUserEvent(
      userCid,
      payload,
      payload.tagsCids,
    );
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENTS.name,
      RMQConstants.exchanges.EVENTS.routingKeys.EVENT_CREATED,
      AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
        cid: event.cid,
        creator: event.creator
          ? {
              creatorCid: event.creator.creatorCid,
              type: event.creator.type,
            }
          : undefined,
      }),
    );
    return EventsService.mapDbEventToEventResponse({
      ...event,
      userStats: {
        isUserLike: false,
        userStatus: undefined,
      },
      tags: tags,
    });
  }

  static mapDbEventToEventResponse(
    event: AppTypes.EventsService.Event.IEventWithUserMetadataAndTags,
  ): AppDto.EventsServiceDto.EventsDto.EventResponseDto {
    return AppDto.EventsServiceDto.EventsDto.EventResponseDto.create({
      id: event.id,
      ageLimit: event.ageLimit,
      endTime: event.endTime,
      eventType: event.eventType,
      location: {
        coordinates: event.location.coordinates,
        country: event.location.country,
      },
      slug: event.slug,
      startTime: event.startTime,
      title: event.title,
      userStats: event.userStats,
      creator: event.creator,
      description: event.description,
      thumbnail:
        event.thumbnail &&
        (event.creator
          ? AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
              event.thumbnail,
              AppTypes.AssetsSerivce.Other.SizeName.S_4_3,
            )
          : event.thumbnail),
      // assets: event.assets,
      accessibility: event.accessibility,
      cid: event.cid,
      tags: event.tags,
    });
  }

  static mapDbEventToSingleEventResponse(
    event: AppTypes.EventsService.Event.IEvent,
    city: Omit<AppTypes.Shared.City.ICity, 'location'> | undefined,
    eventStats: AppTypes.EventsService.Event.IEventStats,
    userStats: AppTypes.EventsService.Event.IEventWithUserMetadataAndTags['userStats'],
    tags: AppTypes.EventsService.EventTags.ISafeTag[],
  ): AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto {
    return AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto.create({
      id: event.id,
      cid: event.cid,
      ageLimit: event.ageLimit,
      endTime: event.endTime,
      eventType: event.eventType,
      location: {
        coordinates: event.location.coordinates,
        country: event.location.country,
        city: city?.name,
      },
      slug: event.slug,
      startTime: event.startTime,
      title: event.title,
      userStats: userStats,
      creator: event.creator,
      description: event.description,
      thumbnail:
        event.assets[0] &&
        (event.creator
          ? AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
              event.assets[0],
              AppTypes.AssetsSerivce.Other.SizeName.S_4_3,
            )
          : event.assets[0]),
      assets: event.creator
        ? event.assets.map((asset) =>
            AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
              asset,
              AppTypes.AssetsSerivce.Other.SizeName.S_4_3,
            ),
          )
        : event.assets,
      accessibility: event.accessibility,
      createdAt: event.createdAt,
      stats: eventStats,
      tickets: event.tickets,
      updatedAt: event.updatedAt,
      link: event.link,
      tags: tags,
    });
  }
}
