import { PopulatedDoc } from 'mongoose';
import { IEvent } from '../event';

export enum EventsUsersStatusType {
  WANT_GO = 'want-go',
  APPROVED = 'approved',
  TICKETS_PURCHASED = 'tickets-purchased',
}

export interface IEventsUsers {
  event: PopulatedDoc<IEvent>;
  userCId: string;
  userStatus?: EventsUsersStatusType;
  isUserLike: boolean;
}
