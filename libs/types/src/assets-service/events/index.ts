import { EventsService } from '@app/types/events-service';
import { ObjectId } from 'mongoose';

export interface IEvent {
  id: string;
  cid: string;
  creator?: ICreator;
  assets: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreator {
  creatorCid: string;
  type: EventsService.Event.CreatorType;
}
