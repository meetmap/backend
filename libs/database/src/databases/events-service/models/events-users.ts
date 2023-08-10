import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const EventsUsersSchema =
  new mongoose.Schema<AppTypes.EventsService.EventsUsers.IEventsUsers>(
    {
      eventCid: {
        type: mongoose.SchemaTypes.String,
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
        enum: AppTypes.EventsService.EventsUsers.EventsUsersStatusType,
      },
    },
    {
      // _id: false,
      timestamps: true,
    },
  );
//there shouldn't be duplicates in database
EventsUsersSchema.index(
  {
    eventCid: 1,
    userCId: 1,
  } satisfies Partial<
    Record<
      keyof AppTypes.EventsService.EventsUsers.IEventsUsers,
      mongoose.IndexDirection
    >
  >,
  {
    unique: true,
  },
);
