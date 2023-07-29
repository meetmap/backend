import { AppTypes } from '@app/types';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface IUsersBase {
  id: string;
  cid: string;
  username: string;
  name: string;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnyUser
  extends AppTypes.AuthService.Users.IUser,
    AppTypes.EventsService.Users.IUser,
    AppTypes.LocationService.Users.IUser,
    AppTypes.UsersService.Users.IUser {}
