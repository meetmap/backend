import { googleGeocodeAxios } from '@app/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import {
  IGoogleReverseResponse,
  INominatimReverseResponse,
  IReverseCountryResponse,
  IReverseLocalityResponse,
} from './types';

@Injectable()
export class GeocodingService implements OnModuleInit {
  private readonly secret_key = this.configService.getOrThrow(
    'GOOGLE_MAPS_API_KEY',
  );

  private limiter = new Bottleneck({
    // datastore: 'redis',
    maxConcurrent: 1,
    minTime: 1000,
    id: 'meetmap-geocoding',
    clearDatastore: false,
    // clientOptions: {
    //   url: this.configService.getOrThrow('CACHE_ENDPOINT'),
    //   pingInterval: 10000,
    // },
  });

  constructor(private readonly configService: ConfigService) {}
  public async onModuleInit() {
    await this.limiter.ready();
  }

  public async reverseLocality({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }): Promise<IReverseLocalityResponse> {
    const { data } = await googleGeocodeAxios<IGoogleReverseResponse>('', {
      params: {
        latlng: [lat, lng].join(','),
        key: this.secret_key,
        result_type: 'locality', //i.e kind of town
        language: 'en',
      },
    });
    const result = data.results[0];
    if (!result) {
      console.warn(`Result for latlng: ${[lat, lng].join(',')} not found.`);
      return await this.reverseCityNominatim({ lat, lng });
    }
    let localityName = result.address_components.find((comp) =>
      comp.types.includes('locality'),
    )?.long_name;

    let countryName = result.address_components.find((comp) =>
      comp.types.includes('country'),
    )?.long_name;

    const coordinates = result.geometry.location;
    const place_id = result.place_id;

    if (!countryName) {
      console.warn(`Country for latlng: ${[lat, lng].join(',')} not found.`);

      const nominatim = await this.reverseCityNominatim({ lat, lng });
      countryName = nominatim.country?.en_name;
    }

    if (!localityName) {
      console.warn(`Locality for latlng: ${[lat, lng].join(',')} not found.`);
      const nominatim = await this.reverseCityNominatim({ lat, lng });
      localityName = nominatim.locality?.en_name;
    }

    return {
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      country: countryName ? { en_name: countryName } : undefined,
      locality: localityName ? { en_name: localityName } : undefined,
      place_id: place_id,
    };
  }

  public async reverseCityNominatim({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }): Promise<IReverseLocalityResponse> {
    const { data } = await this.limiter.schedule(() =>
      axios.get<INominatimReverseResponse>(
        'https://nominatim.openstreetmap.org/reverse.php',
        {
          params: {
            lat: lat,
            lon: lng,
            zoom: 10, //cities level
            format: 'jsonv2',
            lan: 'en',
            namedetails: 1,
          },
          headers: {
            'Accept-Language': 'en',
          },
        },
      ),
    );
    // debugger;
    const country = data.address.country;
    const locality =
      data.namedetails['name:en'] ??
      data.address.city ??
      data.address.town ??
      data.address.state_district;
    return {
      coordinates: { lat: +data.lat, lng: +data.lon },
      country: country ? { en_name: country } : undefined,
      locality: locality
        ? {
            en_name: locality,
          }
        : undefined,
    };
  }

  public async reverseCountryNominatim({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }): Promise<IReverseCountryResponse | null> {
    const { data } = await this.limiter.schedule(() =>
      axios.get<INominatimReverseResponse>(
        'https://nominatim.openstreetmap.org/reverse.php',
        {
          params: {
            lat: lat,
            lon: lng,
            zoom: 1, //country level
            format: 'jsonv2',
            lan: 'en',
            namedetails: 1,
          },
          headers: {
            'Accept-Language': 'en',
          },
        },
      ),
    );
    // debugger;
    const country = data.namedetails['name:en'] ?? data.address.country;

    return country
      ? {
          coordinates: { lat: +data.lat, lng: +data.lon },
          en_name: country,
        }
      : null;
  }

  public async reverseCountry({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }): Promise<IReverseCountryResponse | null> {
    console.log('fetching');
    const { data } = await googleGeocodeAxios<IGoogleReverseResponse>('', {
      params: {
        latlng: [lat, lng].join(','),
        key: this.secret_key,
        result_type: 'country',
        language: 'en',
      },
    });
    console.log('fetched');

    const result = data.results[0];
    if (!result) {
      console.warn(`Result for latlng: ${[lat, lng].join(',')} not found.`);
      return await this.reverseCountryNominatim({ lat, lng });
    }

    const country = result.address_components.find((comp) =>
      comp.types.includes('country'),
    );

    const coordinates = result.geometry.location;
    const place_id = result.place_id;

    if (!country) {
      console.warn(`Country for latlng: ${[lat, lng].join(',')} not found.`);
      return await this.reverseCountryNominatim({ lat, lng });
    }

    return {
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      en_name: country.long_name,
      place_id: place_id,
    };
  }
}
