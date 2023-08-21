import { PointSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const LocalitySchema =
  new mongoose.Schema<AppTypes.Shared.Locality.ILocality>(
    {
      en_name: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      coordinates: {
        type: PointSchema,
        index: '2dsphere',
      },
      google_place_id: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        sparse: true,
      },
      countryId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Country',
      },
    },
    {
      id: true,
    },
  );
