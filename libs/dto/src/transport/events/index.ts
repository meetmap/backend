import { BaseDto } from '@app/dto/base';
import { IdField, NestedField, StringField } from '@app/dto/decorators';
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

export class EventsServiceEventRequestDto
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
