import { FriendshipStatus } from '../friends';

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
  > {
  friendshipStatus: FriendshipStatus | null;
}

export interface IMainAppSafeUserWithoutFriends
  extends Omit<IMainAppSafeUser, 'friends'> {}
export interface IMainAppSafeUser
  extends Omit<IMainAppSafePartialUser, 'friendshipStatus'> {
  friends: IMainAppSafeUserWithoutFriends[];
  friendshipStatus: FriendshipStatus | null;
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

export interface IAuthUserWithPassword extends IAuthUser {
  password: string;
}

//location-service

export interface ILocationServiceUser
  extends Pick<IUser, 'id' | 'cid' | 'username' | 'profilePicture' | 'name'> {}

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

export interface IAuthServiceSnapshotUser
  extends Pick<
    IAuthUser,
    'phone' | 'email' | 'username' | 'birthDate' | 'cid' | 'name' | 'fbId'
  > {}

export interface IUsersServiceSnapshotUser
  extends Pick<
    IMainAppUser,
    'cid' | 'name' | 'description' | 'profilePicture'
  > {}
