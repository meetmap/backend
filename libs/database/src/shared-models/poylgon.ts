import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const PolygonSchema =
  new mongoose.Schema<AppTypes.Shared.Location.IPolygon>(
    {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    {
      _id: false,
    },
  );
