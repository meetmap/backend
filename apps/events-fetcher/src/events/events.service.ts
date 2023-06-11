import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { EventerFetcherService } from '../eventer-fetcher/eventer-fetcher.service';
import { CreateEventSchema } from './dto';
import { EventsDal } from './events.dal';
import * as path from 'path';
import { GetEventsByLocationRequestDto } from '@app/dto/events-fetcher/events.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly dal: EventsDal,
    private readonly eventerFetcherService: EventerFetcherService,
  ) {}

  public async getEventsByKeywords(keywords: string) {
    return this.dal.getEventsByKeywords(keywords);
  }

  // public async getEventBySlug(slug: string) {
  //   const event = await this.eventerFetcherService.getValidEvent(slug);
  //   if (!event) {
  //     throw new NotFoundException('Event not found');
  //   }
  //   return event;
  // }

  public async getEventById(eventId: string) {
    const event = await this.dal.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  public async getEventsByLocation(dto: GetEventsByLocationRequestDto) {
    const { latitude, longitude, radius } = dto;
    const events = await this.dal.getEventsByLocation(
      longitude,
      latitude,
      radius,
    );

    return events;
  }

  public async userCreateEvent(
    body: string,
    userCId: string,
    image: Express.Multer.File,
  ) {
    try {
      const parsedJson = JSON.parse(body);
      const eventData = CreateEventSchema.parse(parsedJson);
      const event = await this.dal.createUserEvent(eventData, userCId);
      const imageUrl = await this.dal.uploadToPublicEventsAssestsBucket(
        event.id.concat('-main-image').concat(path.extname(image.originalname)),
        image.buffer,
      );
      const eventWithPicture = await this.dal.updatePictureForEvent(
        event.id,
        imageUrl,
      );
      return eventWithPicture;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException(error);
      }
      if (error instanceof ZodError) {
        throw new BadRequestException(error);
      } else {
        console.log(error);
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }
}
