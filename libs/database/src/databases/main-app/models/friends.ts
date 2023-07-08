import { FriendsBaseSchema } from '@app/database/shared-models/friends.base';
import { IMainAppFriends } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema = new mongoose.Schema<IMainAppFriends>(
  {
    ...FriendsBaseSchema.obj,
  },
  {
    id: true,
    timestamps: true,
  },
);
