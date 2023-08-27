import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const UploadsStatusSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.UploadsStatus.IUploadsStatus>(
    {
      status: {
        required: true,
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType,
      },
      type: {
        required: true,
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.AssetsSerivce.UploadsStatus.UploadType,
      },
      reason: {
        type: mongoose.SchemaTypes.String,
      },
      userCid: {
        type: mongoose.SchemaTypes.String,
        // required: true,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
