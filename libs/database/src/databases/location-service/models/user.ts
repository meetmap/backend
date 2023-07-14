import { ILocationServiceUser } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<ILocationServiceUser>(
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
  },
  {
    id: true,
    timestamps: true,
  },
);
