import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UploadStatusSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.EventsAssets.IEventsAssets>(
    {
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
