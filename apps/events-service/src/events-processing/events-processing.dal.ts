import { EventsServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsProcessingDal {
  constructor(private readonly db: EventsServiceDatabase) {}

  public getEventsWithoutTagsCursor() {
    return this.db.models.event
      .find({
        tagsCids: { $size: 0 },
      })
      .cursor({
        batchSize: 50,
      });
  }
  public async getEventByCid(cid: string) {
    return await this.db.models.event.findOne({ cid });
  }

  public async getEventsTags() {
    const tags = await this.db.models.eventTags
      .find<Pick<AppTypes.EventsService.EventTags.ITag, 'label'>>({})
      .select('label' satisfies keyof AppTypes.EventsService.EventTags.ITag);
    return tags.map((tag) => tag.label);
  }

  /**
   *
   * @returns maximum is 15 tags
   */
  public async getTagsCids(tags: string[]) {
    const data = await this.db.models.eventTags
      .find<Pick<AppTypes.EventsService.EventTags.ITag, 'cid'>>({
        label: {
          $in: tags,
        },
      })
      .select('cid' satisfies keyof AppTypes.EventsService.EventTags.ITag);

    return data.map((item) => item.cid).slice(0, 15);
  }

  public async assignTagsToEvent(eventCid: string, tagsCids: string[]) {
    return await this.db.models.event.findOneAndUpdate(
      {
        cid: eventCid,
      },
      {
        $set: {
          tagsCids: tagsCids.slice(0, 15),
        },
      },
      {
        new: true,
      },
    );
  }
}
