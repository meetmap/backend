import { IEventsServiceUser } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<IEventsServiceUser>(
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
    },
    birthDate: {
      type: mongoose.SchemaTypes.Date,
      required: true,
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
