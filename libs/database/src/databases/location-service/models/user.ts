import { ILocationServiceUser } from '@app/types';
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<ILocationServiceUser>(
  {
    // authUserId: {
    //   type: mongoose.SchemaTypes.String,
    //   required: true,
    //   unique: true,
    // },
    cid: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    friendsCids: {
      type: [mongoose.SchemaTypes.String],
    },
  },
  {
    id: true,
    timestamps: true,
  },
);
