import { eventerAxios } from '@app/axios';
import { EventsFetcherDb } from '@app/database';

import { RedisService } from '@app/redis';
import {
  IEvent,
  IEventCache,
  IEventerFullEventResponse,
  IEventerSlideResponse,
} from '@app/types';
import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class EventerFetcherDal {
  constructor(
    @Inject(RedisService.name)
    private readonly eventsCacheClient: RedisService<IEventCache>,
    private readonly database: EventsFetcherDb,
  ) {}
  public async updateEvent(
    eventId: string,
    payload: Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IEvent | null> {
    return this.database.models.event.findByIdAndUpdate(eventId, {
      ...payload,
      updatedAt: undefined,
      createdAt: undefined,
      id: undefined,
    });
  }
  public async storeEvent(
    payload: Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IEvent> {
    return await this.database.models.event.create(
      payload as Omit<IEvent, 'id'>,
    );
  }

  public async fetchEventerList(
    keywords: string,
  ): Promise<IEventerSlideResponse[]> {
    try {
      const response = await eventerAxios.get<IEventerSlideResponse[]>(
        'https://www.eventer.co.il/search/slides/'.concat(
          encodeURIComponent(keywords),
        ),
        {
          timeout: 1000 * 5,
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async getDbEventBySlug(eventSlug: string) {
    return this.database.models.event.findOne({ slug: eventSlug });
  }

  public async fetchEventerFullEvent(
    eventSlug: string,
  ): Promise<IEventerFullEventResponse | null> {
    try {
      const response = await eventerAxios.get<IEventerFullEventResponse>(
        `https://www.eventer.co.il/events/explainNames/${eventSlug}.js?isInEventerSite=true`,
        {
          timeout: 1000 * 5,
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error({
          msg: 'Failed to fetch event',
          reason: error.response.data.message,
        });
      } else {
        console.error(error);
      }
      return null;
    }
  }

  public async getAllCities() {
    return this.database.models.city.find({});
  }

  public async getCityByCoordinates(longitude: number, latitude: number) {
    return this.database.models.city.findOne({
      location: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      },
    });
  }
}
