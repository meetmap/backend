import { Module } from '@nestjs/common';
import { EventsFetcherController } from './events-fetcher.controller';
import { EventsFetcherService } from './events-fetcher.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { EventsFetcherDal } from './events-fetcher.dal';
import { RedisModule } from '@app/redis';

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
  ],
  controllers: [EventsFetcherController],
  providers: [EventsFetcherService, EventsFetcherDal],
})
export class EventsFetcherModule {}
