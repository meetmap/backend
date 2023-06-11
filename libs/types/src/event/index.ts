import { ILocation } from '../location';

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

  tickets: ITicket[];

  createdAt: Date;
  updatedAt: Date;
}

export interface ICreator {
  type: CreatorType;
  creatorCId: string;
}
export enum CreatorType {
  USER = 'user',
  TICKETING_PLATFOFRM = 'ticketing-platform',
}

export enum EventType {
  USER_PUBLIC = 'user-public',
  USER_PRIVATE = 'user-private',
  PARTNER_EVENT = 'partner-event',
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
