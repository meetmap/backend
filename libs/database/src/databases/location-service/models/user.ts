import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema =
  new mongoose.Schema<AppTypes.LocationService.Users.IUser>(
    {
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      profilePicture: {
        type: mongoose.SchemaTypes.String,
      },
      username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      name: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      gender: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.Shared.Users.Gender,
        required: true,
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
