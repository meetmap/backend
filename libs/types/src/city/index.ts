import { IPolygon } from '../location';

export interface ICity {
  id: string;
  name: string;
  location: IPolygon;
}
