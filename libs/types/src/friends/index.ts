import { PopulatedDoc } from 'mongoose';
import { IUser } from '../user';

export interface IFriends {
  requester: PopulatedDoc<IUser>;
  recipient: PopulatedDoc<IUser>;
  status: FriendshipStatus;
}

export type FriendshipStatus =
  | 'add-friend'
  | 'requested'
  | 'pending'
  | 'rejected'
  | 'friends';
