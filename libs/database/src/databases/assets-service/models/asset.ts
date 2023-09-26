import { CreatorSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
import { AssetSizeSchema } from './asset-size';

export const AssetSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Asset.IAsset>(
    {
      cid: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
      },
      creator: {
        type: CreatorSchema,
      },
      file_format: {
        type: mongoose.SchemaTypes.String,
        // required: true,
      },
      original_filename: {
        type: mongoose.SchemaTypes.String,
        // required: true,
      },
      s3_key: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      type: {
        enum: AppTypes.AssetsSerivce.Asset.AssetType,
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      status: {
        enum: AppTypes.AssetsSerivce.Asset.ProcessingStatus,
        type: mongoose.SchemaTypes.String,
        required: true,
        default: AppTypes.AssetsSerivce.Asset.ProcessingStatus.UPLOADING,
      },
      upload_progress: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
      },
      order: {
        type: mongoose.SchemaTypes.Number,
        required: true,
      },
      failureReason: {
        type: mongoose.SchemaTypes.String,
      },
      sizes: {
        type: [AssetSizeSchema],
        required: true,
        default: [],
      },
    },

    {
      id: true,
      timestamps: true,
    },
  );
