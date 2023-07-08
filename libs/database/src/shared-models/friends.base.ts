import { FriendshipStatus, IFriendsBase } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsBaseSchema = new mongoose.Schema<IFriendsBase>(
  {
    requesterCId: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    recipientCId: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    status: {
      type: mongoose.SchemaTypes.String,
      required: true,
      enum: FriendshipStatus,
      default: FriendshipStatus.ADD_FRIEND,
    },
  },
  {
    id: true,
    timestamps: true,
  },
);
