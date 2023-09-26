import { CreatorSchema } from '@app/database/shared-models';
import { arrayMaxLength } from '@app/database/shared-validators';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';
import { AssetSchema } from './asset';

import { LocationSchema } from './location';
import { TicketSchema } from './ticket';

export const EventSchema =
  new mongoose.Schema<AppTypes.EventsService.Event.IEvent>(
    {
      description: {
        type: mongoose.SchemaTypes.String,
      },
      link: {
        type: mongoose.SchemaTypes.String,
        // required: true,
      },
      cid: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      assets: {
        type: [AssetSchema],
        default: [],
      },
      ageLimit: {
        type: mongoose.SchemaTypes.Number,
        required: true,
      },
      endTime: {
        type: mongoose.SchemaTypes.Date,
        required: true,
      },
      startTime: {
        type: mongoose.SchemaTypes.Date,
        required: true,
      },
      title: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      slug: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
      },
      location: {
        type: LocationSchema,
        required: true,
      },
      eventType: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.EventsService.Event.EventType,
        required: true,
      },
      accessibility: {
        type: mongoose.SchemaTypes.String,
        enum: AppTypes.EventsService.Event.EventAccessibilityType,
        required: true,
        default: AppTypes.EventsService.Event.EventAccessibilityType.PUBLIC,
      },
      tickets: {
        type: [TicketSchema],
        requried: true,
      },
      creator: {
        type: CreatorSchema,
      },
      tagsCids: {
        type: [mongoose.SchemaTypes.String],
        default: [],
        validate: [arrayMaxLength(15), 'Limit is 15 tags'],
        index: -1,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );

EventSchema.index(
  { description: 'text', title: 'text' } satisfies Partial<
    Record<keyof AppTypes.EventsService.Event.IEvent, mongoose.IndexDirection>
  >,
  {
    weights: {
      title: 3,
      description: 1,
    },
    default_language: 'english',
  },
);
