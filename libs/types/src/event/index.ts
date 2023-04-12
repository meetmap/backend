import { ILocation } from '../location';

export interface IEvent {
  id: string;
  slug: string;
  link: string;
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

  location: ILocation;

  createdAt: Date;
  updatedAt: Date;
}
