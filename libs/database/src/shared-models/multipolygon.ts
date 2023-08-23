import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const MultiPolygonSchema =
  new mongoose.Schema<AppTypes.Shared.Location.IMultiPolygon>(
    {
      type: {
        type: String,
        enum: ['MultiPolygon'],
        required: true,
      },
      coordinates: {
        type: [[[[Number]]]],
        required: true,
      },
    },
    {
      _id: false,
    },
  );
