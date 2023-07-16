import { FriendsBaseSchema } from '@app/database/shared-models';
import { IEventsServiceFriends } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema = new mongoose.Schema<IEventsServiceFriends>(
  {
    ...FriendsBaseSchema.obj,
  },
  {
    id: true,
    timestamps: true,
  },
);
