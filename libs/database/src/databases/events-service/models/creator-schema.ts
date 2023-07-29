import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const CreatorSchema =
  new mongoose.Schema<AppTypes.EventsService.Event.ICreator>(
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
