import { EventsUsersStatusType, IEventsUsers } from '@app/types';
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
      default: false,
    },
    userStatus: {
      type: mongoose.SchemaTypes.String,
      enum: EventsUsersStatusType,
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
