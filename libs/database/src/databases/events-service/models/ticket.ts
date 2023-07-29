import { PriceSchema } from '@app/database/shared-models';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const TicketSchema =
  new mongoose.Schema<AppTypes.EventsService.Event.ITicket>(
    {
      description: {
        type: mongoose.SchemaTypes.String,
      },
      name: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
      price: {
        type: PriceSchema,
        required: true,
      },
      amount: {
        type: mongoose.SchemaTypes.Number,
        default: -1,
      },
    },
    {
      _id: false,
    },
  );
