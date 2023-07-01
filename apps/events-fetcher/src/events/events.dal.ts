import { RADIANS_PER_KILOMETER } from '@app/constants';
import { EventsFetcherDb } from '@app/database';
import { S3UploaderService } from '@app/s3-uploader';
import {
  CreatorType,
  EventType,
  ICity,
  IEvent,
  ILocation,
  ITicket,
} from '@app/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { CreateEventSchema } from './dto';

@Injectable()
export class EventsDal {
  constructor(
    private readonly db: EventsFetcherDb,
    private readonly s3Service: S3UploaderService,
  ) {}

  public async getEventById(eventId: string): Promise<IEvent | null> {
    return this.db.models.event.findById(eventId);
  }
  public async getEventsByKeywords(keywords: string): Promise<IEvent[]> {
    const regex = new RegExp(keywords, 'i');
    return await this.db.models.event.find({
      $or: [
        {
          title: {
            $regex: regex,
          },
        },
        {
          description: {
            $regex: regex,
          },
        },
      ],
    });
  }
  public async getEventsByLocation(
    longitude: number,
    latitude: number,
    radius: number,
  ) {
    return await this.db.models.event.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude],
            this.getRadiusInRadians(radius),
          ],
        },
      },
    });
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
      eventType: EventType[payload.eventType] ?? EventType.USER_PUBLIC,
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
    return event;
  }

  public async uploadToPublicEventsAssestsBucket(key: string, file: Buffer) {
    const { url } = await this.s3Service.upload(
      'events-assets/'.concat(key),
      file,
    );
    return url;
  }
}
