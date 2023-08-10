import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const EventTagsSchema =
  new mongoose.Schema<AppTypes.EventsService.EventTags.ITag>(
    {
      label: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      count: {
        type: mongoose.SchemaTypes.Number,
        default: 0,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );

EventTagsSchema.index(
  { label: 'text' } satisfies Partial<
    Record<keyof AppTypes.EventsService.EventTags.ITag, mongoose.IndexDirection>
  >,
  {
    weights: {
      label: 1,
    } satisfies Partial<
      Record<keyof AppTypes.EventsService.EventTags.ITag, number>
    >,
    default_language: 'english',
  },
);
