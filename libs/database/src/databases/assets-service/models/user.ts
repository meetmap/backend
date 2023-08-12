import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Users.IUser>(
    {
      username: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
      },
      name: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      gender: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.Shared.Users.Gender,
        required: true,
      },
      profilePicture: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'UserAssets',
      },
      lastTimeOnline: {
        type: mongoose.SchemaTypes.Date,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
