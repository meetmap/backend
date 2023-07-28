import { Shared } from '@app/types/shared';

export interface IUser extends Shared.Users.IUsersBase {
  birthDate: Date;
  description?: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  fbId?: string;
}

export interface IUserWithoutFriends
  extends Omit<ISafeUser, 'friends' | 'createdAt' | 'updatedAt'> {}

export interface ISafeUser extends Omit<IUser, 'createdAt' | 'updatedAt'> {
  friends: IUserWithoutFriends[];
  friendshipStatus: Shared.Friends.FriendshipStatus | null;
}

export interface ISafePartialUser
  extends Omit<IUser, 'createdAt' | 'updatedAt'> {
  friendshipStatus: Shared.Friends.FriendshipStatus | null;
}
