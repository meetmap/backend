import { IdField, NestedField, StringField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class EventsServiceCreatorRequestDto
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
  implements AppTypes.Transport.Snapshot.Events.IEventsServiceSnapshotEvent
{
  @IdField()
  cid: string;
  @NestedField(EventsServiceCreatorRequestDto, {
    optional: true,
  })
  creator?: AppTypes.EventsService.Event.ICreator | undefined;
}
