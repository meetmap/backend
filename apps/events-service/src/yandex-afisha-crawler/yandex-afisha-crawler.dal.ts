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
}
