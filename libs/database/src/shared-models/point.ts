import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const PointSchema = new mongoose.Schema<AppTypes.Shared.Location.IPoint>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  {
    _id: false,
  },
);
