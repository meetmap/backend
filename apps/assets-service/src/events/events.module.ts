import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsDal } from './events.dal';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService, EventsDal],
  controllers: [EventsController],
})
export class EventsModule {}
