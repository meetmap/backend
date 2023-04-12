import { PointSchema } from '@app/database/shared-models';
import { ILocation, IPoint } from '@app/types';
import * as mongoose from 'mongoose';

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
    index: '2dsphere',
  },
});
