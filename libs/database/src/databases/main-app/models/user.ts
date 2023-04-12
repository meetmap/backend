import { IUser } from '@app/types';
import * as mongoose from 'mongoose';

import { PointSchema } from '@app/database/shared-models';

export const UserSchema = new mongoose.Schema<IUser>(
  {
    nickname: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      required: true,
    },
    coordinates: {
      type: PointSchema,
    },
    age: {
      type: mongoose.SchemaTypes.Number,
      required: true,
    },
    email: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      required: true,
    },
    phone: {
      type: mongoose.SchemaTypes.String,
      unique: true,
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
