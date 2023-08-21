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

@Injectable()
export class EventsServiceDatabase extends AbstractBaseDatabase {
  public async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    for (const modelName in this.models) {
      await this.models[modelName].syncIndexes();
    }
    // const a = this.models.event.setMaxListeners(1);
    // const eventEmitter = a.watch();
    // eventEmitter.on('change', (data) => {
    //   console.log(data);
    //   console.log(data._id);
    // });
    // for await (const eventsUsers of this.models.eventsUsers
    //   .aggregate([
    //     {
    //       $match: {
    //         event: {
    //           $exists: true,
    //         },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: 'events',
    //         localField: 'event',
    //         foreignField: '_id',
    //         as: 'ev',
    //       },
    //     },
    //     {
    //       $unwind: {
    //         path: '$ev',
    //       },
    //     },
    //   ])
    //   .cursor()) {
    //   await this.models.eventsUsers.updateMany(eventsUsers._id, {
    //     $set: {
    //       eventCid: eventsUsers.ev.cid,
    //     },
    //     $unset: {
    //       event: '',
    //     },
    //   });
    // }
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
    };
  }
}
