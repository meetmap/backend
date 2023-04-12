import { ILocation, IPoint } from '@app/types';
import * as mongoose from 'mongoose';
import { PointSchema } from './point';
import { CitySchema } from './city';

export const LocationSchema = new mongoose.Schema<ILocation>({
  cityId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'City',
  },
  country: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },

  coordinates: {
    type: PointSchema,
    required: true,
  },
});
