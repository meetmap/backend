import { IAuthUser, IUser } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<IAuthUser>(
  {
    username: {
      type: mongoose.SchemaTypes.String,
      unique: true,
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
  },
  {
    id: true,
    timestamps: true,
  },
);
