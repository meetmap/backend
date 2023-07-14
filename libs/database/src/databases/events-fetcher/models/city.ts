import { ICity } from '@app/types';
import * as mongoose from 'mongoose';
import { PolygonSchema } from '../../../shared-models/poylgon';

export const CitySchema = new mongoose.Schema<ICity>(
  {
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    location: {
      type: PolygonSchema,
      required: true,
    },
  },
  {
    id: true,
  },
);
