import { IMainAppUser, IUser } from '@app/types';
import * as mongoose from 'mongoose';

import { PointSchema } from '@app/database/shared-models';

export const UserSchema = new mongoose.Schema<IMainAppUser>(
  {
    username: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      required: true,
    },
    birthDate: {
      type: mongoose.SchemaTypes.Date,
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
      sparse: true,
    },
    friendsIds: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
    ],
    authUserId: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    cid: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
  },
  {
    id: true,
    timestamps: true,
  },
);
