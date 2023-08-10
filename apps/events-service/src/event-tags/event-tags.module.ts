import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventTagsDal } from './event-tags.dal';
import { EventTagsService } from './event-tags.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [EventTagsService, EventTagsDal],
})
export class EventTagsModule {}
