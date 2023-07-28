import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema =
  new mongoose.Schema<AppTypes.UsersService.Users.IUser>(
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
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      fbId: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        sparse: true,
      },
      profilePicture: {
        type: mongoose.SchemaTypes.String,
      },
      description: {
        type: mongoose.SchemaTypes.String,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
