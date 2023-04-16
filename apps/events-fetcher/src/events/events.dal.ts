import { RADIANS_PER_KILOMETER } from '@app/constants';
import { EventsFetcherDb } from '@app/database';
import { IEvent } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsDal {
  constructor(private readonly db: EventsFetcherDb) {}

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
}
