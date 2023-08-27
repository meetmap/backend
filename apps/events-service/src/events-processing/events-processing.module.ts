import { Module } from '@nestjs/common';
import { EventsProcessingController } from './events-processing.controller';
import { EventsProcessingDal } from './events-processing.dal';
import { EventsProcessingService } from './events-processing.service';

@Module({
  imports: [],
  providers: [EventsProcessingService, EventsProcessingDal],
  controllers: [EventsProcessingController],
})
export class EventsProcessingModule {}
