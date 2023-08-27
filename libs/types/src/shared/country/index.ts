import { IPoint } from '../location';

export interface ICountry {
  id: string;
  // local_name: string;
  en_name: string;
  google_place_id?: string;
  coordinates: IPoint;
  currency?: string;
  // location: IMultiPolygon;
}
