import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@app/auth';
import { RabbitmqModule } from '@app/rabbitmq';
import { RedisModule } from '@app/redis';
import { S3UploaderModule } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { EventerFetcherModule } from './eventer-fetcher/eventer-fetcher.module';
import { EventsFetcherController } from './events-service.controller';
import { EventsModule } from './events/events.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { TicketingPlatofrmsModule } from './ticketing-platofrm/ticketing-platofrm.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    DatabaseModule.init({
      connectionStringEnvPath: 'EVENTS_SERVICE_DATABASE_URL',
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.EVENTS_SERVICE,
    }),
    AuthModule.init({
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.EVENTS_SERVICE,
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
