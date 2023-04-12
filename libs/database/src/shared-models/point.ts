import { IPoint } from '@app/types';
import * as mongoose from 'mongoose';

export const PointSchema = new mongoose.Schema<IPoint>({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});
