import { arrayMaxLength } from '@app/database/shared-validators';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const CreatorSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Events.ICreator>(
    {
      creatorCid: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      type: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.EventsService.Event.CreatorType,
        required: true,
      },
    },
    {
      _id: false,
    },
  );

export const EventsSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Events.IEvent>(
    {
      assets: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'EventsAssets',
        default: [],
        validate: [arrayMaxLength(10), 'Limit is 10 assets'],
      },
      creator: {
        type: CreatorSchema,
      },
      cid: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
