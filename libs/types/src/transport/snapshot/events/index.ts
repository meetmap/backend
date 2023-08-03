import { EventsService } from '@app/types/events-service';

export interface IEventsServiceSnapshotEvent
  extends Pick<EventsService.Event.IEvent, 'creator' | 'cid'> {}
