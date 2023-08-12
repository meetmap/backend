import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<AppTypes.AuthService.Users.IUser>(
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
    birthDate: {
      type: mongoose.SchemaTypes.Date,
      required: true,
    },
    cid: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    fbToken: {
      type: mongoose.SchemaTypes.String,
    },
    fbId: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      sparse: true,
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
