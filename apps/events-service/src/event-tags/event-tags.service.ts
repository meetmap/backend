import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EventTagsDal } from './event-tags.dal';

@Injectable()
export class EventTagsService {
  constructor(private readonly dal: EventTagsDal) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey: [
      RMQConstants.exchanges.JOBS.routingKeys.EVENTS_SERVICE_TAGS_SYNC_REQUEST,
    ],
    queue: 'events-service.sync.tags',
  })
  public async syncTagsMetadataJob() {
    console.log('Event tags sync job started');
    const maxBatchSize = 50;
    const tagsCursor = this.dal.getAllEventTagsCursor();
    const tagsCidsBatch: string[] = [];
    for await (const tag of tagsCursor) {
      tagsCidsBatch.push(tag.cid);
      if (tagsCidsBatch.length >= maxBatchSize) {
        await this.syncTags([...tagsCidsBatch]);
        tagsCidsBatch.length = 0;
      }
    }
    await this.syncTags([...tagsCidsBatch]);
    tagsCidsBatch.length = 0;
    console.log('Event tags sync job finished');
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENTS.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_CHANGED_OR_CREATED,
    ],
    queue: 'events-service.event-tags.sync',
  })
  public async syncTagsHandler(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const event = await this.dal.getEventByCid(payload.eventCid);
    if (!event) {
      return;
    }
    await this.syncTags(event.tagsCids);
  }
  private async syncTags(tagsCids: string[]) {
    const tags = await this.dal.getTagsWithCountBulk(tagsCids);
    await this.dal.updateTagsCountBulk(
      tags.map((tag) => ({ cid: tag.cid, count: tag.count })),
    );
  }
}
