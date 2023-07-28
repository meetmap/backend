export enum FriendshipStatus {
  ADD_FRIEND = 'add-friend',

  REQUESTED = 'requested',
  PENDING = 'pending',
  REJECTED = 'rejected',
  FRIENDS = 'friends',
}

export interface IFriendsBase {
  id: string;
  requesterCId: string;
  recipientCId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}
