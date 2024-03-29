import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';

import { AiProcessingModule } from '@app/ai-processing';
import { AuthModule } from '@app/auth';
import { GeocodingModule } from '@app/geocoding';
import { RabbitmqModule } from '@app/rabbitmq';
import { RedisModule } from '@app/redis';
import { S3UploaderModule } from '@app/s3-uploader';
import { SearchModule } from '@app/search';
import { AppTypes } from '@app/types';
import { CityProcessingModule } from './city-processing/city-processing.module';
import { EventTagsModule } from './event-tags/event-tags.module';
import { EventerFetcherModule } from './eventer-fetcher/eventer-fetcher.module';
import { EventsProcessingModule } from './events-processing/events-processing.module';
import { EventsFetcherController } from './events-service.controller';
import { EventsModule } from './events/events.module';
import { SearchJobsModule } from './search-jobs/search-jobs.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { TicketingPlatofrmsModule } from './ticketing-platofrm/ticketing-platofrm.module';
import { UserModule } from './users/users.module';
import { YandexAfishaCrawlerModule } from './yandex-afisha-crawler/yandex-afisha-crawler.module';

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
    SearchModule,
    GeocodingModule,
    // InternalAxiosModule,
    EventerFetcherModule,
    EventsModule,
    UserModule,
    TicketingPlatofrmsModule,
    AiProcessingModule,
    SnapshotModule,
    EventsProcessingModule,
    EventTagsModule,
    SearchJobsModule,
    CityProcessingModule,
    YandexAfishaCrawlerModule,
  ],
  controllers: [EventsFetcherController],
  providers: [],
})
export class EventsFetcherModule {}
