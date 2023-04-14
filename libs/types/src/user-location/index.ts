export interface IUserLocation {
  userId: string;
  location: ICoordinates;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}
