import { EventsService } from '@app/types/events-service';

export interface IEventsServiceEvent
  extends Pick<EventsService.Event.IEvent, 'creator' | 'cid'> {}
