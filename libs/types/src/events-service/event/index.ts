import { Shared } from '@app/types/shared';
import { ISafeTag } from '../event-tags';
import { IEventsUsers } from '../events-users';

export interface IEvent {
  id: string;
  cid: string;
  slug: string;
  link?: string;
  title: string;
  assets: string[];
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
  location: Shared.Location.IEntityLocation;

  eventType: EventType;

  accessibility: EventAccessibilityType;

  tickets: ITicket[];

  tagsCids: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IEventWithLocation extends Omit<IEvent, 'location'> {
  location: Shared.Location.IEntityLocationPopulated;
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

export interface IEventStats {
  likes: number;
  ticketsPurchased: number;
  wantGo: number;
}
export interface IEventWithUserMetadataAndTags extends IEventWithLocation {
  thumbnail?: string;
  userStats: Pick<IEventsUsers, 'isUserLike' | 'userStatus'>;
  tags: ISafeTag[];
}

export interface IMinimalEventByLocation extends Pick<IEvent, 'id' | 'cid'> {
  thumbnail?: string;
  isThirdParty: boolean;
  coordinates: Shared.Location.IPoint['coordinates'];
}
