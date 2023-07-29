import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';
import {
  ApiKeySchema,
  CitySchema,
  EventSchema,
  EventsUsersSchema,
  FriendsSchema,
  TicketingPlatformSchema,
  UserSchema,
} from './models';

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
      ticketingPlatform: this.connection.model(
        'TicketingPlatform',
        TicketingPlatformSchema,
      ),
      apiKey: this.connection.model('ApiKey', ApiKeySchema),
      eventsUsers: this.connection.model('EventsUsers', EventsUsersSchema),
      users: this.connection.model('User', UserSchema),
      friends: this.connection.model('Friends', FriendsSchema),
    };
  }
}
