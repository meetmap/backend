import { PointSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const CountrySchema =
  new mongoose.Schema<AppTypes.Shared.Country.ICountry>(
    {
      coordinates: {
        type: PointSchema,
        required: true,
        index: '2dsphere',
      },
      google_place_id: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        sparse: true,
      },
      en_name: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
        sparse: true,
      },
    },
    {
      id: true,
    },
  );
