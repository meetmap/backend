import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';
import {
  ApiKeySchema,
  CountrySchema,
  EventSchema,
  EventsUsersSchema,
  EventTagsSchema,
  FriendsSchema,
  LocalitySchema,
  TicketingPlatformSchema,
  UserSchema,
} from './models';
import { CitySchema } from './models/city';
import { EventProcessingSchema } from './models/event-processing';

@Injectable()
export class EventsServiceDatabase extends AbstractBaseDatabase {
  public async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    for (const modelName in this.models) {
      await this.models[modelName].syncIndexes();
    }
  }
  public override get models() {
    return {
      event: this.connection.model('Event', EventSchema),
      city: this.connection.model('City', CitySchema),
      locality: this.connection.model('Locality', LocalitySchema),
      country: this.connection.model('Country', CountrySchema),
      ticketingPlatform: this.connection.model(
        'TicketingPlatform',
        TicketingPlatformSchema,
      ),
      apiKey: this.connection.model('ApiKey', ApiKeySchema),
      eventsUsers: this.connection.model('EventsUsers', EventsUsersSchema),
      users: this.connection.model('User', UserSchema),
      friends: this.connection.model('Friends', FriendsSchema),
      eventTags: this.connection.model('EventTags', EventTagsSchema),
      eventProcessing: this.connection.model(
        'EventProcessing',
        EventProcessingSchema,
      ),
    };
  }
}
