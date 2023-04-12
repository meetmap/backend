import { IFriends } from '@app/types';
import * as mongoose from 'mongoose';

import { PointSchema } from '@app/database/shared-models';

export const FriendsSchema = new mongoose.Schema<IFriends>(
  {
    requestor: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    recipient: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    status: {
      type: mongoose.SchemaTypes.String,
      enum: ['add-friend', 'requested', 'pending', 'rejected'],
      default: 'add-friend',
    },
  },
  {
    id: true,
    timestamps: true,
  },
);
