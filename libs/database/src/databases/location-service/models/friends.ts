import { FriendsBaseSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const FriendsSchema =
  new mongoose.Schema<AppTypes.LocationService.Friends.IFriends>(
    {
      ...FriendsBaseSchema.obj,
      recipientLocationStatus: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.LocationService.Friends.FriendsLocationStatus,
        required: true,
        default:
          AppTypes.LocationService.Friends.FriendsLocationStatus.SHOW_LOCATION,
      },
      requesterLocationStatus: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.LocationService.Friends.FriendsLocationStatus,
        required: true,
        default:
          AppTypes.LocationService.Friends.FriendsLocationStatus.SHOW_LOCATION,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
