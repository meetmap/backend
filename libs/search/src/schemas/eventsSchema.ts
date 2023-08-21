import { AppTypes } from '@app/types';
import { BaseSchema } from './base';

export const EventsSchema = new BaseSchema<AppTypes.Search.Event.ICachedEvent>({
  cid: {
    type: 'keyword',
  },
  title: {
    type: 'text',
    analyzer: 'standard',
    term_vector: 'yes',
  },
  description: {
    type: 'text',
    analyzer: 'standard',
    optional: true,
    term_vector: 'yes',
  },
  tags: {
    type: 'nested',
    properties: {
      cid: {
        type: 'keyword',
      },
      label: {
        type: 'text',
      },
    },
  },
  // ageLimit: {
  //   type: 'integer',
  // },
  // city: {
  //   type: 'keyword',
  // },
  // country: {
  //   type: 'keyword',
  // },
  // endTime: {
  //   type: 'date',
  // },
  // startTime: {
  //   type: 'date',
  // },
});
