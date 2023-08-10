import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsProcessingDal } from './events-processing.dal';
import { EventsProcessingService } from './events-processing.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [EventsProcessingService, EventsProcessingDal],
})
export class EventsProcessingModule {}
