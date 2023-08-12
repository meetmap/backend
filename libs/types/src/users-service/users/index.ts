import { Other } from '@app/types/other';
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
  extends Omit<ISafeUserWithFriends, 'friends' | 'createdAt' | 'updatedAt'> {}

export interface ISafeUserWithFriends
  extends Omit<IUser, 'createdAt' | 'updatedAt'> {
  friends: Other.PaginatedResponse.IPaginatedResponse<IUserWithoutFriends>;
  friendshipStatus: Shared.Friends.FriendshipStatus | null;
}

export interface ISafePartialUser
  extends Omit<IUser, 'createdAt' | 'updatedAt'> {
  friendshipStatus: Shared.Friends.FriendshipStatus | null;
}
