import { Shared } from '@app/types/shared';

export interface IUser extends Shared.Users.IUsersBase {
  refreshToken?: string;
  email: string;
  password?: string;
  phone?: string;
  birthDate: Date;
  fbId?: string;
  fbToken?: string;
}

export interface ISafeUser
  extends Omit<
    IUser,
    'fbToken' | 'password' | 'refreshToken' | 'updatedAt' | 'createdAt'
  > {}

export interface IUserWithPassword extends IUser {
  password: string;
}
