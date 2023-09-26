import { EventsService } from '@app/types/events-service';

export interface IEvent {
  id: string;
  cid: string;
  creator?: ICreator;
  assets: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreator {
  creatorCid: string;
  type: EventsService.Event.CreatorType;
}
