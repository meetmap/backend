import { Shared } from '@app/types/shared';

export interface IUser extends Shared.Users.IUsersBase {
  profilePicture?: string;
}

export interface ILocation {
  cid: string;
  location: ICoordinates | null;
  updatedAt: Date | null;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IRedisLocation {
  cid: string;
  location: ICoordinates;
  updatedAt: Date;
}
