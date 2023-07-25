import { PopulatedDoc } from 'mongoose';
import { ILocation, IPoint } from '../location';

export interface IEvent {
  id: string;
  slug: string;
  link?: string;
  title: string;
  picture?: string;
  description?: string;
  /**
   *  timestamp
   */
  startTime: Date;

  /**
   * timestamp
   */
  endTime: Date;

  ageLimit: number;

  creator?: ICreator;
  location: ILocation;

  eventType: EventType;

  accessibility: EventAccessibilityType;

  tickets: ITicket[];

  createdAt: Date;
  updatedAt: Date;
}

export interface ICreator {
  type: CreatorType;
  creatorCid: string;
}
export enum CreatorType {
  USER = 'user',
  TICKETING_PLATFOFRM = 'ticketing-platform',
}

export enum EventType {
  USER = 'user',
  ORGANIZER = 'organizer',
  PARTNER = 'partner',
}

export enum EventAccessibilityType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum EventsUsersStatusType {
  WANT_GO = 'want-go',
  APPROVED = 'approved',
  TICKETS_PURCHASED = 'tickets-purchased',
}

export interface ITicket {
  name: string;
  description?: string;
  price: IPrice;
  /**
   * -1 means Infinity\
   * 0 means OOS
   */
  amount: -1 | 0 | number;
}

export interface IPrice {
  //change to concrete currencies later
  currency: string;

  amount: number;
}

export interface IEventsUsers {
  event: PopulatedDoc<IEvent>;
  userCId: string;
  userStatus?: EventsUsersStatusType;
  isUserLike: boolean;
}

export interface IEventStats {
  likes: number;
  ticketsPurchased: number;
  wantGo: number;
}
export interface IEventWithUserStats extends IEvent {
  userStats: Pick<IEventsUsers, 'isUserLike' | 'userStatus'>;
}

export interface IMinimalEventByLocation
  extends Pick<IEvent, 'id' | 'picture'> {
  coordinates: IPoint['coordinates'];
}
