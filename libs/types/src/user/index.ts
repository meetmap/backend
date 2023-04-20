import { PopulatedDoc } from 'mongoose';
import { IFriends } from '../friends';
import { IPoint } from '../location';

export interface IUser {
  id: string;
  username: string;
  phone?: string;
  email: string;
  password?: string;
  refreshToken?: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // coordinates?: IPoint;
  friendsIds: PopulatedDoc<IFriends>[];
}

export interface ISafeUser
  extends Pick<
    IUser,
    'birthDate' | 'friendsIds' | 'email' | 'phone' | 'username' | 'id'
  > {}
export interface IUserWithPassword extends IUser {
  password: string;
}
