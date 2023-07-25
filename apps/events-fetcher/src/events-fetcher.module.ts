import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@app/auth';
import { RabbitmqModule } from '@app/rabbitmq';
import { RedisModule } from '@app/redis';
import { S3UploaderModule } from '@app/s3-uploader';
import { EventerFetcherModule } from './eventer-fetcher/eventer-fetcher.module';
import { EventsFetcherController } from './events-fetcher.controller';
import { EventsModule } from './events/events.module';
import { TicketingPlatofrmsModule } from './ticketing-platofrm/ticketing-platofrm.module';
import { UserModule } from './users/users.module';
import { SnapshotModule } from './snapshot/snapshot.module';

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
    RabbitmqModule.forRoot(),
    // InternalAxiosModule,
    EventerFetcherModule,
    EventsModule,
    UserModule,
    TicketingPlatofrmsModule,
    SnapshotModule,
  ],
  controllers: [EventsFetcherController],
  providers: [],
})
export class EventsFetcherModule {}
