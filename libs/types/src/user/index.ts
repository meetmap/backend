import { PopulatedDoc } from 'mongoose';
import { IFriends } from '../friends';
import { IPoint } from '../location';

export interface IUser {
  id: string;
  nickname: string;
  phone?: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
  coordinates?: IPoint;
  friendsIds: PopulatedDoc<IFriends>[];
}
