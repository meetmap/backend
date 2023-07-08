export interface IFriendsBase {
  requesterCId: string;
  recipientCId: string;
  status: FriendshipStatus;
}

export interface IMainAppFriends extends IFriendsBase {}

export interface ILocationServiceFriends extends IFriendsBase {
  locationStatus: FriendsLocationStatus;
}

export interface IEventsFetcherFriends extends IFriendsBase {}

export enum FriendsLocationStatus {
  SHOW_LOCATION = 'show',
  NOT_SHOW_LOCATION = 'not-show',
}

export enum FriendshipStatus {
  ADD_FRIEND = 'add-friend',
  REQUESTED = 'requested',
  PENDING = 'pending',
  REJECTED = 'rejected',
  FRIENDS = 'friends',
}

// export interface IFriend
