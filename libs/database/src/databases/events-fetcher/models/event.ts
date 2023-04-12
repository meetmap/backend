import { IEvent } from '@app/types';
import * as mongoose from 'mongoose';
import { LocationSchema } from './location';

export const EventSchema = new mongoose.Schema<IEvent>(
  {
    description: {
      type: mongoose.SchemaTypes.String,
    },
    link: {
      type: mongoose.SchemaTypes.String,
      required: true,
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
  },
  {
    id: true,
    timestamps: true,
  },
);
