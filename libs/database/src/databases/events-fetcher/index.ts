import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { BaseDatabase, IDatabaseServiceConfig } from '../types';
import {
  ApiKeySchema,
  CitySchema,
  EventSchema,
  EventsUsersSchema,
  TicketingPlatformSchema,
  UserSchema,
} from './models';

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
      eventsUsers: mongoose.model('EventsUsers', EventsUsersSchema),
      user: mongoose.model('User', UserSchema),
    };
  }
}
