import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const PriceSchema =
  new mongoose.Schema<AppTypes.EventsService.Event.IPrice>(
    {
      currency: {
        type: mongoose.Schema.Types.String,
        required: true,
      },
      amount: {
        type: mongoose.Schema.Types.Number,
        default: 0,
      },
    },
    {
      _id: false,
    },
  );
