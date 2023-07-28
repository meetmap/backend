import { Shared } from '@app/types/shared';

export interface IUser
  extends Omit<Shared.Users.IUsersBase, 'createdAt' | 'updatedAt'> {
  phone?: string;
  email: string;
  birthDate: Date;
  fbId?: string;
  description?: string;
  profilePicture?: string;
}
