import { FriendsBaseSchema } from '@app/database/shared-models/friends.base';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema =
  new mongoose.Schema<AppTypes.UsersService.Friends.IFriends>(
    {
      ...FriendsBaseSchema.obj,
    },
    {
      id: true,
      timestamps: true,
    },
  );
