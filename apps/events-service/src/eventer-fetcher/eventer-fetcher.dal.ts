import { eventerAxios } from '@app/axios';
import { EventsServiceDatabase } from '@app/database';
import { GeocodingService } from '@app/geocoding';

import { AppTypes } from '@app/types';

import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';

@Injectable()
export class EventerFetcherDal {
  constructor(
    private readonly db: EventsServiceDatabase,
    private readonly geocoder: GeocodingService,
  ) {}

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
    return this.db.models.event.findOne({ slug: eventSlug });
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
    return this.db.models.city.find({});
  }
}
