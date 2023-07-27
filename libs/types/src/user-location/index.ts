export interface IUserLocation {
  cid: string;
  location: ICoordinates | null;
  updatedAt: Date | null;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IRedisUserLocation {
  cid: string;
  location: ICoordinates;
  updatedAt: Date;
}
