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
  > {}

export interface IMainAppSafeUser
  extends Pick<
    IMainAppUser,
    'birthDate' | 'friendsIds' | 'email' | 'phone' | 'username' | 'id'
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
  > {}

export interface ISafeAuthUser
  extends Pick<
    IAuthUser,
    'id' | 'phone' | 'email' | 'username' | 'birthDate' | 'authUserId'
  > {}

export interface IAuthUserWithPassword extends IAuthUser {
  password: string;
}

// export interface IUserWithPassword extends IUser {
//   password: string;
// }
