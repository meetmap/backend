import { FriendsBaseSchema } from '@app/database/shared-models';
import { IEventsFetcherFriends } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema = new mongoose.Schema<IEventsFetcherFriends>(
  {
    ...FriendsBaseSchema.obj,
  },
  {
    id: true,
    timestamps: true,
  },
);
