import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const EventsAssetsSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.EventsAssets.IEventsAssets>(
    {
      uploadId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'UploadsStatus',
        required: true,
      },
      type: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.AssetsSerivce.Other.AssetType,
        required: true,
      },
      assetKey: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      eventCid: {
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
