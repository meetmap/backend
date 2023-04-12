// export interface ICoordinate {
//   lat: number;
//   lng: number;
// }

import { PopulatedDoc } from 'mongoose';
import { ICity } from '../city';

export interface ILocation {
  country: string;
  cityId?: PopulatedDoc<ICity>;
  coordinates: IPoint;
}

export interface IPoint {
  type: 'Point';
  /**
   * [lng, lat]
   */
  coordinates: [number, number];
}

export interface IPolygon {
  type: 'Polygon';
  /**
   * [lng, lat]
   */
  coordinates: [[number, number][]];
}
