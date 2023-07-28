import { Shared } from '@app/types/shared';

export interface IUser extends Shared.Users.IUsersBase {
  birthDate: Date;
  description?: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  fbId?: string;
}

export interface IUserWithoutFriends extends Omit<ISafeUser, 'friends'> {}

export interface ISafeUser extends IUser {
  friends: IUserWithoutFriends[];
  friendshipStatus: Shared.Friends.FriendshipStatus | null;
}
