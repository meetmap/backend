import { Shared } from '@app/types/shared';

export interface IUser extends Shared.Users.IUsersBase {
  profilePicture?: string;
  birthDate: Date;
  description?: string;
}
