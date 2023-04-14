import { Module } from '@nestjs/common';
import { EventerFetcherModule } from '../eventer-fetcher/eventer-fetcher.module';
import { EventsController } from './events.controller';
import { EventsDal } from './events.dal';
import { EventsService } from './events.service';

@Module({
  imports: [EventerFetcherModule],
  providers: [EventsService, EventsDal],
  controllers: [EventsController],
})
export class EventsModule {}
