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
  public async updateEvent(
    eventId: string,
    eventCid: string,
    payload: AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>,
  ): Promise<AppTypes.EventsService.Event.IEvent | null> {
    return this.db.models.event.findByIdAndUpdate(eventId, {
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
    return await this.db.models.event.create(
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
    };
  }
}
