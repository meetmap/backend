import { EventsServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventTagsDal {
  constructor(private readonly db: EventsServiceDatabase) {}

  public getAllEventTagsCursor() {
    return this.db.models.eventTags.find({}).select({ cid: 1 }).cursor();
  }

  public async updateTagCount(tagCid: string, count: number) {
    return await this.db.models.eventTags.updateOne({
      cid: tagCid,
      count: count,
    } satisfies Partial<AppTypes.EventsService.EventTags.ITag>);
  }

  public async updateTagsCountBulk(tags: { cid: string; count: number }[]) {
    return await this.db.models.eventTags.bulkWrite(
      tags.map((tag) => ({
        updateOne: {
          filter: {
            cid: tag.cid,
          },
          update: {
            $set: {
              count: tag.count,
            } satisfies Partial<AppTypes.EventsService.EventTags.ITag>,
          },
        },
      })),
    );
  }

  public async getEventByCid(eventCid: string) {
    return await this.db.models.event
      .findOne({
        cid: eventCid,
      })
      .lean();
  }
  /**
   *
   * @deprecated
   */
  public async getTagCount(tagCid: string): Promise<number> {
    return await this.db.models.event
      .find({
        tagsCids: tagCid,
      })
      .count();
  }

  public async getTagsWithCountBulk(tagsCids: string[]) {
    return await this.db.models.event.aggregate<{ cid: string; count: number }>(
      [
        {
          $match: { tagsCids: { $in: tagsCids } },
        },
        {
          $unwind: '$tagsCids',
        },
        {
          $match: { tagsCids: { $in: tagsCids } },
        },
        {
          $group: {
            _id: '$tagsCids',
            count: { $sum: 1 },
          },
        },
        {
          $unionWith: {
            coll: 'eventtags', // assuming this is the name of your tags collection
            pipeline: [
              {
                $match: { cid: { $in: tagsCids } },
              },
              {
                $project: {
                  _id: '$cid',
                  count: { $literal: 0 },
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$_id',
            count: { $sum: '$count' },
          },
        },
        {
          $project: {
            cid: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ],
    );
  }
}
