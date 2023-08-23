import * as mongoose from 'mongoose';
// import { ICity } from '../city';

export interface IEntityLocation {
  countryId?: mongoose.Types.ObjectId;
  localityId?: mongoose.Types.ObjectId;
  coordinates: IPoint;
}
export interface IEntityLocationPopulated
  extends Omit<IEntityLocation, 'localityId' | 'countryId'> {
  countryId?: string;
  localityId?: string;
  locality?: string;
  country?: string;
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

export interface IMultiPolygon {
  type: 'MultiPolygon';
  coordinates: IPolygon['coordinates'][];
}

export type GeoJsonPolygon = IPolygon | IMultiPolygon;
