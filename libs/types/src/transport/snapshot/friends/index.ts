import { Shared } from '@app/types/shared';

export interface IUsersServiceSnapshot
  extends Omit<Shared.Friends.IFriendsBase, 'id' | 'createdAt' | 'updatedAt'> {}
