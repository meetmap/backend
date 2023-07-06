import { PopulatedDoc } from 'mongoose';
import { IFriends } from '../friends';
//common user
export interface IUser {
  id: string;
  username: string;
  //@todo name
  name?: string;
  description?: string;
  profilePicture?: string;
  phone?: string;
  email: string;
  password?: string;
  refreshToken?: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // authUserId: string;
  cid: string;
  friendsIds: PopulatedDoc<IFriends>[];
  //facebook
  fbId?: string;
  fbToken?: string;
}
//main-app
export interface IMainAppUser
  extends Pick<
    IUser,
    | 'id'
    | 'description'
    | 'birthDate'
    | 'friendsIds'
    | 'email'
    | 'phone'
    | 'username'
    | 'createdAt'
    | 'updatedAt'
    | 'phone'
    | 'cid'
    | 'name'
    | 'profilePicture'
    | 'fbId'
  > {}

export interface IMainAppSafePartialUser
  extends Pick<
    IMainAppUser,
    | 'birthDate'
    | 'email'
    | 'phone'
    | 'description'
    | 'username'
    | 'id'
    | 'cid'
    | 'name'
    | 'profilePicture'
    | 'fbId'
  > {}
export interface IMainAppSafeUser extends IMainAppSafePartialUser {
  friendsCids: string[];
}
//auth-service
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
    // | 'authUserId'
    | 'cid'
    | 'fbId'
    | 'fbToken'
    | 'name'
  > {}

export interface ISafeAuthUser
  extends Pick<
    IAuthUser,
    | 'id'
    | 'phone'
    | 'email'
    | 'username'
    | 'birthDate'
    | 'cid'
    | 'name'
    | 'fbId'
  > {}

export interface IRmqUser
  extends Pick<
    IUser,
    | 'id'
    | 'phone'
    | 'email'
    | 'username'
    | 'birthDate'
    | 'cid'
    | 'name'
    | 'fbId'
    | 'description'
    | 'profilePicture'
  > {}

export interface IAuthUserWithPassword extends IAuthUser {
  password: string;
}

//location-service

export interface ILocationServiceUser
  extends Pick<IUser, 'id' | 'cid' | 'username' | 'profilePicture' | 'name'> {
  friendsCids: string[];
}

export interface IEventsServiceUser
  extends Pick<
    IUser,
    | 'id'
    | 'cid'
    | 'username'
    | 'profilePicture'
    | 'birthDate'
    | 'name'
    | 'description'
  > {}
