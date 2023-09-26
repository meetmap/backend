import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const AssetSizeSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Asset.IAssetSize>(
    {
      height: {
        type: mongoose.SchemaTypes.Number,
      },
      width: {
        type: mongoose.SchemaTypes.Number,
      },
      s3_key: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      size_label: {
        enum: AppTypes.AssetsSerivce.Asset.SizeLabel,
        type: mongoose.SchemaTypes.String,
        required: true,
      },
    },

    {
      _id: false,
      timestamps: false,
    },
  );
