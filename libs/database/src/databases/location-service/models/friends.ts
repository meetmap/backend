import { FriendsBaseSchema } from '@app/database/shared-models';
import { FriendsLocationStatus, ILocationServiceFriends } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema = new mongoose.Schema<ILocationServiceFriends>(
  {
    ...FriendsBaseSchema.obj,
    locationStatus: {
      type: mongoose.SchemaTypes.String,
      enum: FriendsLocationStatus,
      required: true,
      default: FriendsLocationStatus.SHOW_LOCATION,
    },
  },
  {
    id: true,
    timestamps: true,
  },
);
