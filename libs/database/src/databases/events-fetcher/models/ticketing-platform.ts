import { ICity, IEvent, ITicketingPlatform } from '@app/types';
import * as mongoose from 'mongoose';

export const TicketingPlatformSchema = new mongoose.Schema<ITicketingPlatform>(
  {
    email: {
      type: mongoose.SchemaTypes.String,
      unique: true,
      required: true,
    },
    password: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    title: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    banner: {
      type: mongoose.SchemaTypes.String,
    },
    description: {
      type: mongoose.SchemaTypes.String,
    },
    image: {
      type: mongoose.SchemaTypes.String,
    },
    websiteUrl: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    refreshToken: {
      type: mongoose.SchemaTypes.String,
    },
  },
  {
    id: true,
  },
);
