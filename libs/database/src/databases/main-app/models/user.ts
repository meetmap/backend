import { IUser } from '@app/types';
import * as mongoose from 'mongoose';

import { PointSchema } from '@app/database/shared-models';

export const UserSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      required: true,
    },
    coordinates: {
      type: PointSchema,
    },
    birthDate: {
      type: mongoose.SchemaTypes.Date,
      required: true,
    },
    refreshToken: {
      type: mongoose.SchemaTypes.String,
    },
    email: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      required: true,
    },
    password: {
      type: mongoose.SchemaTypes.String,
    },
    phone: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      sparse: true,
    },
    friendsIds: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Friends',
      },
    ],
  },
  {
    id: true,
    timestamps: true,
  },
);
