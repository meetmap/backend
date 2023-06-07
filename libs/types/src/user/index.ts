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
  authUserId: string;
  cid: string;
  // coordinates?: IPoint;
  friendsIds: PopulatedDoc<IFriends>[];
}

export interface IMainAppUser
  extends Pick<
    IUser,
    | 'id'
    | 'authUserId'
    | 'birthDate'
    | 'friendsIds'
    | 'email'
    | 'phone'
    | 'username'
    | 'createdAt'
    | 'updatedAt'
    | 'phone'
    | 'cid'
  > {}

export interface IMainAppSafeUser
  extends Pick<
    IMainAppUser,
    'birthDate' | 'friendsIds' | 'email' | 'phone' | 'username' | 'id' | 'cid'
    // | 'authUserId'
  > {}

export interface IAuthUser
  extends Pick<
    IUser,
    | 'username'
    | 'refreshToken'
    | 'email'
    | 'password'
    | 'phone'
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'birthDate'
    | 'authUserId'
    | 'cid'
  > {}

export interface ISafeAuthUser
  extends Pick<
    IAuthUser,
    'id' | 'phone' | 'email' | 'username' | 'birthDate' | 'cid'
  > {}

export interface IAuthUserWithPassword extends IAuthUser {
  password: string;
}

export interface ILocationServiceUser
  extends Pick<IUser, 'id' | 'authUserId' | 'cid'> {
  friendsCids: string[];
}
