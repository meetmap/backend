import { EventsServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';
import { EventsDal } from '../events/events.dal';

@Injectable()
export class SearchJobsDal {
  constructor(private readonly db: EventsServiceDatabase) {}

  public getAllEventsCursor(batchSize: number) {
    return this.db.models.event
      .aggregate<AppTypes.Search.Event.ICachedEvent>([
        {
          $lookup: {
            from: 'eventtags',
            localField: 'tagsCids',
            foreignField: 'cid',
            as: 'tags',
            pipeline: [
              {
                $project: {
                  label: true,
                  cid: true,
                  _id: false,
                } satisfies Record<
                  keyof AppTypes.Search.Event.ICachedTag | '_id',
                  boolean
                >,
              },
            ],
          },
        },
        ...EventsDal.getEventsWithPopulatedLocationAggregation(),

        {
          $project: {
            _id: false,
            cid: true,
            description: true,
            title: true,
            tags: true,
            //@todo change it back
            ageLimit: true,
            country: '$location.country',
            locality: '$location.locality',
            endTime: true,
            startTime: true,
          } satisfies Record<
            keyof AppTypes.Search.Event.ICachedEvent | '_id',
            any
          >,
        },
      ])
      .cursor({
        batchSize,
      });
  }

  public async getEventWithTags(
    eventCid: string,
  ): Promise<AppTypes.Search.Event.ICachedEvent | null> {
    const [event] =
      await this.db.models.event.aggregate<AppTypes.Search.Event.ICachedEvent>([
        {
          $match: {
            cid: eventCid,
          } satisfies Pick<AppTypes.EventsService.Event.IEvent, 'cid'>,
        },
        {
          $lookup: {
            from: 'eventtags',
            localField: 'tagsCids',
            foreignField: 'cid',
            as: 'tags',
            pipeline: [
              {
                $project: {
                  label: true,
                  cid: true,
                  _id: false,
                } satisfies Record<
                  keyof AppTypes.Search.Event.ICachedTag | '_id',
                  boolean
                >,
              },
            ],
          },
        },

        ...EventsDal.getEventsWithPopulatedLocationAggregation(),
        {
          $project: {
            _id: false,
            cid: true,
            description: true,
            title: true,
            tags: true,
            ageLimit: true,
            endTime: true,
            country: '$location.country',
            locality: '$location.locality',
            startTime: true,
          } satisfies Record<
            keyof AppTypes.Search.Event.ICachedEvent | '_id',
            any
          >,
        },
      ]);

    return event ?? null;
  }
}
