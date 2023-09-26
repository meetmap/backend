import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const SizeSchema =
  new mongoose.Schema<AppTypes.EventsService.Event.IAssetSize>({
    height: {
      type: mongoose.SchemaTypes.Number,
    },
    width: {
      type: mongoose.SchemaTypes.Number,
    },
    size_label: {
      enum: AppTypes.AssetsSerivce.Asset.SizeLabel,
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    url: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
  });

export const AssetSchema =
  new mongoose.Schema<AppTypes.EventsService.Event.IAsset>(
    {
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      order: {
        type: mongoose.SchemaTypes.Number,
        required: true,
      },
      type: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.AssetsSerivce.Asset.AssetType,
        required: true,
      },
      url: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      sizes: {
        type: [SizeSchema],
        required: true,
        default: [],
      },
    },
    {
      _id: false,
      timestamps: false,
    },
  );
