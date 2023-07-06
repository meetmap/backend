import { IEventsUsers } from '@app/types';
import * as mongoose from 'mongoose';

export const EventsUsersSchema = new mongoose.Schema<IEventsUsers>(
  {
    event: {
      ref: 'Event',
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    userCId: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    isUserLike: {
      type: mongoose.SchemaTypes.Boolean,
      required: true,
    },
    isUserSave: {
      type: mongoose.SchemaTypes.Boolean,
      required: true,
    },
    isUserWillGo: {
      type: mongoose.SchemaTypes.Boolean,
      required: true,
    },
  },
  {
    _id: false,
    timestamps: true,
  },
);
//there shouldn't be duplicates in database
EventsUsersSchema.index(
  {
    event: 1,
    userCId: 1,
  },
  {
    unique: true,
  },
);
