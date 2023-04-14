import { MicroServiceName } from '@app/types';
import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class InternalAxiosService {
  private eventsFetcherAxios: AxiosInstance;
  private locationServiceAxios: AxiosInstance;
  private mainAppAxios: AxiosInstance;
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
  }
  get instance(): Record<MicroServiceName, AxiosInstance> {
    return {
      'events-fetcher': this.eventsFetcherAxios,
      'location-service': this.locationServiceAxios,
      'main-app': this.mainAppAxios,
    };
  }
}
