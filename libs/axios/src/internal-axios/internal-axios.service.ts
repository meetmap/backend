import { MicroServiceName } from '@app/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class InternalAxiosService {
  private eventsFetcherAxios: AxiosInstance;
  private locationServiceAxios: AxiosInstance;
  private mainAppAxios: AxiosInstance;
  private authServiceAxios: AxiosInstance;
  constructor(private readonly configService: ConfigService) {
    this.eventsFetcherAxios = axios.create({
      baseURL: this.configService.getOrThrow('EVENTS_FETCHER_API_URL'),
    });
    this.locationServiceAxios = axios.create({
      baseURL: this.configService.getOrThrow('LOCATION_SERVICE_API_URL'),
    });
    this.mainAppAxios = axios.create({
      baseURL: this.configService.getOrThrow('MAIN_APP_API_URL'),
    });
    this.authServiceAxios = axios.create({
      baseURL: this.configService.getOrThrow('AUTH_SERVICE_API_URL'),
    });
  }
  get instance(): Record<MicroServiceName, AxiosInstance> {
    return {
      'events-service': this.eventsFetcherAxios,
      'location-service': this.locationServiceAxios,
      'users-service': this.mainAppAxios,
      'auth-service': this.authServiceAxios,
    };
  }
}
