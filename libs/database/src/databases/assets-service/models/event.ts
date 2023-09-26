import { CreatorSchema } from '@app/database/shared-models';
import { arrayMaxLength } from '@app/database/shared-validators';
import { AppTypes } from '@app/types';
import * as mongoose from 'mongoose';

export const EventsSchema =
  new mongoose.Schema<AppTypes.AssetsSerivce.Events.IEvent>(
    {
      assets: {
        type: [mongoose.SchemaTypes.String],
        default: [],
        validate: [arrayMaxLength(10), 'Limit is 10 assets'],
      },
      creator: {
        type: CreatorSchema,
      },
      cid: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
      },
    },
    {
      id: true,
      timestamps: true,
    },
  );
