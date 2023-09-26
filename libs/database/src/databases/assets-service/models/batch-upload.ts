import { CreatorSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
import { BatchUploadAssetMetaSchema } from './batch-upload-asset-meta';

export const BatchUploadSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Asset.IBatchUpload>(
    {
      creator: {
        type: CreatorSchema,
      },
      assets: {
        type: [BatchUploadAssetMetaSchema],
        required: true,
      },
      overall_progress: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
