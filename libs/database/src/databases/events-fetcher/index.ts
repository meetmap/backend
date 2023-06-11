import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { BaseDatabase, IDatabaseServiceConfig } from '../types';
import { CitySchema, EventSchema, TicketingPlatformSchema } from './models';
import { ApiKeySchema } from './models/apiKey';

@Injectable()
export class EventsFetcherDb implements BaseDatabase {
  constructor(private readonly config: IDatabaseServiceConfig) {}
  async onModuleInit() {
    // const connectionString = this.configService.getOrThrow('DATABASE_URL');
    await mongoose.connect(this.config.connectionString);
  }

  public get models() {
    return {
      event: mongoose.model('Event', EventSchema),
      city: mongoose.model('City', CitySchema),
      ticketingPlatform: mongoose.model(
        'TicketingPlatform',
        TicketingPlatformSchema,
      ),
      apiKey: mongoose.model('ApiKey', ApiKeySchema),
    };
  }
}
