import { FriendsBaseSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema =
  new mongoose.Schema<AppTypes.EventsService.Friends.IFriends>(
    {
      ...FriendsBaseSchema.obj,
    },
    {
      id: true,
      timestamps: true,
    },
  );
