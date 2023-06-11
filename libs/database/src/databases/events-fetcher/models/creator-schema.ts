import { PointSchema } from '@app/database/shared-models';
import { CreatorType, ICreator, ILocation, IPoint } from '@app/types';
import * as mongoose from 'mongoose';

export const CreatorSchema = new mongoose.Schema<ICreator>(
  {
    creatorCId: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    type: {
      type: mongoose.SchemaTypes.String,
      enum: CreatorType,
      required: true,
    },
  },
  {
    _id: false,
  },
);
