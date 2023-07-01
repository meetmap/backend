import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';

import { RedisModule } from '@app/redis';
import { EventerFetcherModule } from './eventer-fetcher/eventer-fetcher.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from '@app/auth';
import { S3UploaderModule } from '@app/s3-uploader';
import { EventsFetcherController } from './events-fetcher.controller';
import { TicketingPlatofrmsModule } from './ticketing-platofrm/ticketing-platofrm.module';

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
    AuthModule.init({
      microserviceName: 'events-fetcher',
    }),
    S3UploaderModule,
    // RabbitmqModule.forRoot(),
    // InternalAxiosModule,
    EventerFetcherModule,
    EventsModule,
    TicketingPlatofrmsModule,
  ],
  controllers: [EventsFetcherController],
  providers: [],
})
export class EventsFetcherModule {}
