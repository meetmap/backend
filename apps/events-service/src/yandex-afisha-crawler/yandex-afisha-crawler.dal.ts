import { yandexAfishaAxios } from '@app/axios';
import { EventsServiceDatabase } from '@app/database';
import { GeocodingService } from '@app/geocoding';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YandexAfishaCrawlerDal {
  constructor(
    private readonly db: EventsServiceDatabase,
    private readonly geocoder: GeocodingService,
  ) {}

  public async updateEvent(
    eventCid: string,
    payload: AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>,
  ) {
    return this.db.models.event.findOneAndUpdate(
      {
        cid: eventCid,
      },
      {
        $set: {
          ageLimit: payload.ageLimit,
          description: payload.description,
          endTime: payload.endTime,
          startTime: payload.startTime,
          link: payload.link,
          location: payload.location,
          assets: payload.assets,
          slug: payload.slug,
          tickets: payload.tickets,
          title: payload.title,
        },
      },
      { new: true },
    );
  }

  public async createEvent(
    payload: AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent>,
  ) {
    return await this.db.models.event.create({ ...payload });
  }

  public async getAllAfishaCities() {
    //city param has to be like that, it will response with all of the cities
    const response =
      await yandexAfishaAxios.get<AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ICityResponse>(
        '/cities?city=moscow',
      );

    return response.data.data.map((city) => city.id);
  }

  public getAllEventsForCityIterable(city: string, perPage: number = 20) {
    return {
      async *[Symbol.asyncIterator]() {
        let isHaveNext = true;
        let nextOffset = 0;
        const {
          data: { paging, data },
        } =
          await yandexAfishaAxios.get<AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ICityEventsResponse>(
            '/events/actual',
            {
              params: {
                _: Date.now(),
                city: city,
                hasMixed: 0,
                offset: nextOffset,
                limit: perPage,
              },
            },
          );
        isHaveNext = nextOffset + perPage < paging.total;
        nextOffset += perPage;
        yield data;
        while (isHaveNext) {
          const {
            data: { paging, data },
          } =
            await yandexAfishaAxios.get<AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ICityEventsResponse>(
              '/events/actual',
              {
                params: {
                  _: Date.now(),
                  city: city,
                  hasMixed: 0,
                  offset: nextOffset,
                },
              },
            );
          isHaveNext = nextOffset + perPage < paging.total;
          nextOffset += perPage;
          yield data;
        }
      },
    };
  }

  public async getDbEventBySlug(slug: string) {
    return await this.db.models.event
      .findOne({
        slug,
      })
      .lean();
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
