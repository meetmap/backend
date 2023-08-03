import * as mongoose from 'mongoose';
import { ICity } from '../city';

export interface ILocation {
  country: string;
  cityId?: mongoose.Types.ObjectId;
  coordinates: IPoint;
}
export interface ILocationWithCity extends Omit<ILocation, 'cityId'> {
  city?: Omit<ICity, 'location'>;
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
