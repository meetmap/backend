import { Module } from '@nestjs/common';

import { EventerFetcherService } from './eventer-fetcher/eventer-fetcher.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';

import { RedisModule } from '@app/redis';
import { EventerFetcherModule } from './eventer-fetcher/eventer-fetcher.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    DatabaseModule.init({
      connectionStringEnvPath: 'EVENTS_FETCHER_DATABASE_URL',
      microserviceName: 'events-fetcher',
    }),
    EventerFetcherModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class EventsFetcherModule {}
