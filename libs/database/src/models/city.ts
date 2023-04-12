import { ICity, IEvent } from '@app/types';
import * as mongoose from 'mongoose';
import { LocationSchema } from './location';
import { PolygonSchema } from './poylgon';

export const CitySchema = new mongoose.Schema<ICity>(
  {
    name: {
      type: mongoose.SchemaTypes.String,
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
