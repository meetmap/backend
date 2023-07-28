import { Shared } from '@app/types/shared';

export enum FriendsLocationStatus {
  SHOW_LOCATION = 'show',
  NOT_SHOW_LOCATION = 'not-show',
}
export interface IFriends extends Shared.Friends.IFriendsBase {
  requesterLocationStatus: FriendsLocationStatus;
  recipientLocationStatus: FriendsLocationStatus;
}
