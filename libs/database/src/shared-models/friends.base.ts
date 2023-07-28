import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsBaseSchema =
  new mongoose.Schema<AppTypes.Shared.Friends.IFriendsBase>(
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
        enum: AppTypes.Shared.Friends.FriendshipStatus,
        default: AppTypes.Shared.Friends.FriendshipStatus.ADD_FRIEND,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
