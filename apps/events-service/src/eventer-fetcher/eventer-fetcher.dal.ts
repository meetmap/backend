import { eventerAxios } from '@app/axios';
import { EventsServiceDatabase } from '@app/database';

import { AppTypes } from '@app/types';

import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';

@Injectable()
export class EventerFetcherDal {
  constructor(private readonly database: EventsServiceDatabase) {}
  public async updateEvent(
    eventId: string,
    eventCid: string,
    payload: AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>,
  ): Promise<AppTypes.EventsService.Event.IEvent | null> {
    return this.database.models.event.findByIdAndUpdate(eventId, {
      $set: {
        cid: eventCid,
        accessibility: payload.accessibility,
        ageLimit: payload.ageLimit,
        creator: payload.creator,
        description: payload.description,
        endTime: payload.endTime,
        startTime: payload.startTime,
        eventType: AppTypes.EventsService.Event.EventType.PARTNER,
        link: payload.link,
        location: payload.location,
        assets: payload.assets,
        slug: payload.slug,
        tickets: payload.tickets,
        title: payload.title,
      },
      updatedAt: undefined,
      createdAt: undefined,
      id: undefined,
    });
  }
  public async storeEvent(
    payload: AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>,
  ): Promise<AppTypes.EventsService.Event.IEvent> {
    return await this.database.models.event.create(
      payload satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>,
    );
  }

  public async fetchEventerList(
    keywords: string,
  ): Promise<
    AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerSlideResponse[]
  > {
    try {
      const response = await eventerAxios.get<
        AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerSlideResponse[]
      >(
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
  ): Promise<AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerFullEventResponse | null> {
    try {
      const response =
        await eventerAxios.get<AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerFullEventResponse>(
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

  /**
   *
   * @param eventId eventer db id
   */
  public async fetchEventerEventTickets(
    eventId: string,
  ): Promise<AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerTicketsResponse | null> {
    try {
      const response =
        await eventerAxios.get<AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerTicketsResponse>(
          `https://www.eventer.co.il/events/${eventId}/ticketTypes.js?isInEventerSite=true`,
          {
            timeout: 1000 * 5,
          },
        );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error({
          msg: 'Failed to fetch tickets',
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
