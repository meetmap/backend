import { MultiPolygonSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
/**
 * @deprecated remove after populating db
 */
export const CitySchema = new mongoose.Schema<AppTypes.Shared.City.ICity>(
  {
    local_name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    location: {
      type: MultiPolygonSchema,
      required: true,
    },
    en_name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    countryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Country',
      required: true,
    },
  },
  {
    id: true,
  },
);
