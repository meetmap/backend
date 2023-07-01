import { PopulatedDoc } from 'mongoose';
import { IMainAppUser } from '../user';

export interface IFriends {
  requester: PopulatedDoc<IMainAppUser>;
  recipient: PopulatedDoc<IMainAppUser>;
  status: FriendshipStatus;
}

export type FriendshipStatus =
  | 'add-friend'
  | 'requested'
  | 'pending'
  | 'rejected'
  | 'friends';
