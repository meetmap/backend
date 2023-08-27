import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
import { CreatorSchema } from './creator-schema';

export const EventProcessingSchema =
  new mongoose.Schema<AppTypes.EventsService.EventProcessing.EventProcessing>(
    {
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      type: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.EventsService.EventProcessing.ProcessingType,
        required: true,
      },
      creator: {
        type: CreatorSchema,
        // required: true,
      },
      failureReason: {
        type: mongoose.SchemaTypes.String,
      },
      rawEvent: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      eventCid: {
        type: mongoose.SchemaTypes.String,
      },
      status: {
        type: mongoose.SchemaTypes.String,
        default:
          AppTypes.EventsService.EventProcessing.ProcessingStatus.INITIALIZED,
        enum: AppTypes.EventsService.EventProcessing.ProcessingStatus,
        required: true,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
