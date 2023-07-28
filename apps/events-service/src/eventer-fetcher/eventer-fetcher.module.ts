import { Module } from '@nestjs/common';
import { EventerFetcherDal } from './eventer-fetcher.dal';
import { EventerFetcherService } from './eventer-fetcher.service';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [EventerFetcherService, EventerFetcherDal],
  exports: [EventerFetcherService],
})
export class EventerFetcherModule {}
