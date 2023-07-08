import {
  CreateEventSchema,
  EventResponseDto,
  EventStatsResponseDto,
  GetEventsByLocationRequestDto,
  SingleEventResponseDto,
} from '@app/dto/events-fetcher/events.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import { ZodError } from 'zod';
import { EventerFetcherService } from '../eventer-fetcher/eventer-fetcher.service';
import { EventsDal } from './events.dal';

@Injectable()
export class EventsService {
  constructor(
    private readonly dal: EventsDal,
    private readonly eventerFetcherService: EventerFetcherService,
  ) {}

  public async getEventsByKeywords(userCId: string, keywords: string) {
    return this.dal.getEventsByKeywords(userCId, keywords);
  }

  public async getEventById(
    cid: string,
    eventId: string,
  ): Promise<SingleEventResponseDto> {
    const event = await this.dal.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const stats = await this.dal.getEventStats(eventId);
    const userStats = await this.dal.getEventUserStats(eventId, cid);
    return { ...event, stats, userStats };
  }

  public async userAction(
    userCId: string,
    eventId: string,
    type: 'like' | 'want-go',
  ): Promise<EventStatsResponseDto> {
    const event = await this.dal.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.dal.userAction(userCId, eventId, type);
    const stats = await this.dal.getEventStats(eventId);
    return stats;
  }

  public async getEventLikes(eventId: string) {
    return await this.dal.getUsersLikedAnEvent(eventId);
  }
  public async cancelUserAction(
    userCId: string,
    eventId: string,
    type: 'like' | 'want-go',
  ): Promise<EventStatsResponseDto> {
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
    dto: GetEventsByLocationRequestDto,
  ) {
    const { latitude, longitude, radius } = dto;
    const events = await this.dal.getEventsByLocation(
      userCId,
      longitude,
      latitude,
      radius,
    );

    return events;
  }

  public async userCreateEvent(
    body: string,
    userCid: string,
    image: Express.Multer.File,
  ): Promise<EventResponseDto> {
    try {
      const parsedJson = JSON.parse(body);
      const eventData = CreateEventSchema.parse(parsedJson);

      const event = await this.dal.createUserEvent(eventData, userCid);
      const imageUrl = await this.dal.uploadToPublicEventsAssestsBucket(
        event.id.concat('-main-image').concat(path.extname(image.originalname)),
        image.buffer,
      );
      const eventWithPicture = await this.dal.updatePictureForEvent(
        event.id,
        imageUrl,
      );
      return {
        ...eventWithPicture,
        userStats: {
          isUserLike: false,
          userStatus: undefined,
        },
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ZodError) {
        throw new BadRequestException(error.message);
      } else {
        console.log(error);
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }
}
