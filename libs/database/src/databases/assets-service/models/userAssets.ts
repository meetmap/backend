import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UserAssetsSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.UserAssets.IUserAssets>(
    {
      type: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.AssetsSerivce.Other.AssetType,
        required: true,
      },
      uploadId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'UploadsStatus',
        required: true,
      },
      assetKey: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      userCid: {
        type: mongoose.SchemaTypes.String,

        required: true,
      },
      sizes: {
        type: [mongoose.SchemaTypes.String],
        enum: AppTypes.AssetsSerivce.Other.SizeName,
        required: true,
      },
      urls: {
        type: [mongoose.SchemaTypes.String],
        required: true,
      },
    },

    {
      id: true,
      timestamps: true,
    },
  );
