import { BaseDto } from '@app/dto/base';
import { IdField, NestedField, StringField } from '@app/dto/decorators';
import { EventsServiceDto } from '@app/dto/events-service';
import { AppTypes } from '@app/types';

export class EventsServiceCreatorRequestDto
  extends BaseDto
  implements AppTypes.EventsService.Event.ICreator
{
  @StringField({
    enum: AppTypes.EventsService.Event.CreatorType,
  })
  type: AppTypes.EventsService.Event.CreatorType;
  @IdField()
  creatorCid: string;
}

export class EventsServiceEventSnapshotRequestDto
  extends BaseDto
  implements AppTypes.Transport.Snapshot.Events.IEventsServiceSnapshotEvent
{
  @IdField()
  cid: string;
  @NestedField(EventsServiceCreatorRequestDto, {
    optional: true,
  })
  creator?: AppTypes.EventsService.Event.ICreator | undefined;
}

export class EventRequestDto extends BaseDto {
  @StringField()
  eventCid: string;
}

export class EventProcessingStepRequestDto extends BaseDto {
  @StringField()
  processingCid: string;

  @StringField({ optional: true })
  failureReason?: string;
}

class EventCreator implements AppTypes.EventsService.Event.ICreator {
  @StringField({ enum: AppTypes.EventsService.Event.CreatorType })
  type: AppTypes.EventsService.Event.CreatorType;
  @StringField()
  creatorCid: string;
}

/**
 * i.e for internal usage to init flow
 */
export class CreateTicketingPlatformEventRequestDto extends EventsServiceDto
  .EventProcessing.CreateTicketingPlatformEventRequestDto {
  @NestedField(EventCreator, { optional: true })
  creator?: EventCreator | undefined;
}

/**
 * i.e for internal usage to init flow
 */
export class UpdateTicketingPlatformEventRequestDto extends EventsServiceDto
  .EventProcessing.UpdateTicketingPlatformEventRequestDto {
  @NestedField(EventCreator, { optional: true })
  creator?: EventCreator | undefined;
}

export class CreateEventPayload extends EventsServiceDto.EventProcessing
  .CreateEventRequestDto {
  @StringField()
  slug: string;
  @StringField()
  cid: string;
  @NestedField(EventCreator, {
    optional: true,
  })
  creator?: EventCreator | undefined;
  @StringField()
  processingCid: string;
  @StringField({ optional: true })
  link?: string;
  @StringField({
    enum: AppTypes.EventsService.Event.EventType,
  })
  eventType: AppTypes.EventsService.Event.EventType;
  @StringField({
    isArray: true,
    maxArrayLength: 10,
    minArrayLength: 1,
    optional: true,
  })
  assetsUrls?: string[];
}

export class UpdateEventPayload extends EventsServiceDto.EventProcessing
  .UpdateEventRequestDto {
  @StringField()
  cid: string;
  @NestedField(EventCreator, {
    optional: true,
  })
  creator?: EventCreator | undefined;
  @StringField()
  processingCid: string;
  @StringField({ optional: true })
  link?: string;
}
