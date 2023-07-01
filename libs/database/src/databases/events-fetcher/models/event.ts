import { PriceSchema } from '@app/database/shared-models';
import { CreatorType, EventType, IEvent } from '@app/types';
import * as mongoose from 'mongoose';
import { CreatorSchema } from './creator-schema';
import { LocationSchema } from './location';
import { TicketSchema } from './ticket';

export const EventSchema = new mongoose.Schema<IEvent>(
  {
    description: {
      type: mongoose.SchemaTypes.String,
    },
    link: {
      type: mongoose.SchemaTypes.String,
      // required: true,
    },
    picture: {
      type: mongoose.SchemaTypes.String,
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
      enum: EventType,
      required: true,
    },
    tickets: {
      type: [TicketSchema],
      requried: true,
    },
    creator: {
      type: CreatorSchema,
    },
  },
  {
    id: true,
    timestamps: true,
  },
);
