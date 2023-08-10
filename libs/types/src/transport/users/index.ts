import { Shared } from '@app/types/shared';

export interface IUser
  extends Omit<Shared.Users.IUsersBase, 'createdAt' | 'updatedAt' | 'id'> {
  phone?: string;
  email: string;
  birthDate: Date;
  fbId?: string;
  description?: string;
  profilePicture?: string;
}

export interface IUpdatedUser extends Partial<IUser> {
  cid: string;
}

export interface ICreatedUser
  extends Omit<Shared.Users.IUsersBase, 'createdAt' | 'updatedAt' | 'id'> {
  phone?: string;
  email: string;
  birthDate: Date;
  fbId?: string;
}
