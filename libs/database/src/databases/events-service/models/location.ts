import { PointSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const LocationSchema =
  new mongoose.Schema<AppTypes.Shared.Location.IEntityLocation>(
    {
      localityId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Locality',
      },
      countryId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Country',
        // required: true,
      },
      coordinates: {
        type: PointSchema,
        required: true,
        index: '2dsphere',
      },
    },
    {
      _id: false,
    },
  );
