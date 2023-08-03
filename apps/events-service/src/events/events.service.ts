import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventerFetcherService } from '../eventer-fetcher/eventer-fetcher.service';
import { UsersService } from '../users/users.service';
import { EventsDal } from './events.dal';

@Injectable()
export class EventsService {
  constructor(
    private readonly dal: EventsDal,
    private readonly eventerFetcherService: EventerFetcherService,
    private readonly rmqService: RabbitmqService,
  ) {}

  public async updateEventsPicture(eventCid: string, keys: string[]) {
    await this.dal.updatePicturesForEvent(eventCid, keys);
  }

  public async getEventsByKeywords(userCId: string, keywords: string) {
    const events = await this.dal.getEventsByKeywords(userCId, keywords);
    return events.map(EventsService.mapDbEventToEventResponse);
  }

  public async getEventById(
    cid: string,
    eventId: string,
  ): Promise<AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto> {
    const event = await this.dal.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const eventStats = await this.dal.getEventStats(eventId);
    const userStats = await this.dal.getEventUserStats(eventId, cid);
    return EventsService.mapDbEventToSingleEventResponse(
      event,
      event.location.city,
      eventStats,
      userStats,
    );
  }

  public async userAction(
    userCId: string,
    eventId: string,
    type: 'like' | 'want-go',
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const event = await this.dal.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.dal.userAction(userCId, eventId, type);
    const stats = await this.dal.getEventStats(eventId);
    return stats;
  }

  public async getEventLikes(eventId: string) {
    const users = await this.dal.getUsersLikedAnEvent(eventId);
    return users.map(UsersService.mapEventsUserToUserResponseDto);
  }
  public async cancelUserAction(
    userCId: string,
    eventId: string,
    type: 'like' | 'want-go',
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const event = await this.dal.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.dal.cancelUserAction(userCId, eventId, type);
    const stats = await this.dal.getEventStats(eventId);
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
    return events.map(EventsService.mapDbEventToMinimalEventByLocationResponse);
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
    const event = await this.dal.createUserEvent(userCid, payload);
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENTS.name,
      RMQConstants.exchanges.EVENTS.routingKeys.EVENT_CREATED,
      EventsService.mapDbEventToEventRmqRequest(event),
    );
    return EventsService.mapDbEventToEventResponse({
      ...event,
      userStats: {
        isUserLike: false,
        userStatus: undefined,
      },
    });
  }

  static mapDbEventToEventRmqRequest(
    event: AppTypes.EventsService.Event.IEvent,
  ): AppDto.TransportDto.Events.EventsServiceEventRequestDto {
    return {
      cid: event.cid,
      creator: event.creator
        ? {
            creatorCid: event.creator.creatorCid,
            type: event.creator.type,
          }
        : undefined,
    };
  }

  static mapDbEventToEventResponse(
    event: AppTypes.EventsService.Event.IEventWithUserStats,
  ): AppDto.EventsServiceDto.EventsDto.EventResponseDto {
    return {
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
      // assets: event.assets,
      accessibility: event.accessibility,
      cid: event.cid,
    };
  }

  static mapDbEventToMinimalEventByLocationResponse(
    event: AppTypes.EventsService.Event.IMinimalEventByLocation,
  ): AppDto.EventsServiceDto.EventsDto.MinimalEventByLocationResponseDto {
    return {
      coordinates: event.coordinates,
      id: event.id,
      thumbnail:
        event.thumbnail &&
        (event.isThirdParty
          ? AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
              event.thumbnail,
              AppTypes.AssetsSerivce.Other.SizeName.S_4_3,
            )
          : event.thumbnail),
    };
  }

  static mapDbEventToSingleEventResponse(
    event: AppTypes.EventsService.Event.IEvent,
    city: Omit<AppTypes.Shared.City.ICity, 'location'> | undefined,
    eventStats: AppTypes.EventsService.Event.IEventStats,
    userStats: AppTypes.EventsService.Event.IEventWithUserStats['userStats'],
  ): AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto {
    return {
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
    };
  }
}
