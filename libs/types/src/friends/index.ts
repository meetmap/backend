export interface IFriendsBase {
  requesterCId: string;
  recipientCId: string;
  status: FriendshipStatus;
}

export interface IMainAppFriends extends IFriendsBase {}

export interface ILocationServiceFriends extends IFriendsBase {
  locationStatus: FriendsLocationStatus;
}

export interface IEventsServiceFriends extends IFriendsBase {}

export enum FriendsLocationStatus {
  SHOW_LOCATION = 'show',
  NOT_SHOW_LOCATION = 'not-show',
}

/**
 * requested means current user send friendship request to another user (i.e. outcoming)
 *
 * pending means another user send friendship request to current user (i.e. incoming)
 */
export enum FriendshipStatus {
  ADD_FRIEND = 'add-friend',

  REQUESTED = 'requested',
  PENDING = 'pending',
  REJECTED = 'rejected',
  FRIENDS = 'friends',
}

// export interface IFriend
