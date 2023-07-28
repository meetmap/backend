import { Shared } from '@app/types/shared';

export interface IUser extends Shared.Users.IUsersBase {
  phone?: string;
  email: string;
  birthDate: Date;
  fbId?: string;
  description?: string;
  profilePicture?: string;
}
