import { PointSchema } from '@app/database/shared-models';
import { CreatorType, IApiKey, ICreator, ILocation, IPoint } from '@app/types';
import * as mongoose from 'mongoose';

export const ApiKeySchema = new mongoose.Schema<IApiKey>(
  {
    title: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    description: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    expires: {
      type: mongoose.SchemaTypes.Date,
    },
    key: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    issuedTo: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'TicketingPlatform',
      required: true,
    },
  },
  {
    id: true,
    timestamps: {
      createdAt: true,
    },
  },
);
