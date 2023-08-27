import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { SearchService } from '@app/search';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { SearchJobsDal } from './search-jobs.dal';

@Injectable()
export class SearchJobsService {
  constructor(
    private readonly rmqService: RabbitmqService,
    private readonly searchService: SearchService,
    private readonly dal: SearchJobsDal,
  ) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey: [
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTS_SEARCH_WARMING_REQUEST,
    ],
    queue: 'events-service.search-warming.events',
  })
  public async warmEventsSearchJob() {
    const batchSize = 50;
    let multiplier = 0;
    console.log('Events search cache warming task started');
    const eventsCursor = this.dal.getAllEventsCursor(batchSize);
    const eventsBatch: AppTypes.Search.Event.ICachedEvent[] = [];
    for await (const event of eventsCursor) {
      eventsBatch.push(event);

      if (eventsBatch.length === batchSize) {
        await this.searchService.indexes.events.putBulk(
          eventsBatch.map((event) => ({
            cid: event.cid,
            description: event.description,
            tags: event.tags.map((tag) => ({ cid: tag.cid, label: tag.label })),
            title: event.title,
            _id: event.cid,
            ageLimit: event.ageLimit,
            locality: event.locality,
            country: event.country,
            endTime: event.endTime,
            startTime: event.startTime,
          })),
        );

        console.log(
          `${
            multiplier * batchSize + eventsBatch.length
          } events has been cached`,
        );
        eventsBatch.length = 0; // clear the batch array
        multiplier += 1;
      }
    }
    // don't forget the last batch
    if (eventsBatch.length > 0) {
      await this.searchService.indexes.events.putBulk(
        eventsBatch.map((event) => ({
          cid: event.cid,
          description: event.description,
          tags: event.tags.map((tag) => ({ cid: tag.cid, label: tag.label })),
          title: event.title,
          _id: event.cid,
          ageLimit: event.ageLimit,
          locality: event.locality,
          country: event.country,
          endTime: event.endTime,
          startTime: event.startTime,
          // id:event.cid
        })),
      );
      console.log(
        `${
          multiplier * batchSize + eventsBatch.length
        } events has been warmed up`,
      );
    }
    console.log('Events search cache warming task ended');
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENTS.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_CHANGED_OR_CREATED,
    ],
    queue: 'events-service.search-warming.handle-event',
  })
  public async handleUpdatedOrCreatedEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    console.log(`Handling search caching for event: ${payload.eventCid}`);
    const event = await this.dal.getEventWithTags(payload.eventCid);
    if (!event) {
      console.warn(`Event ${payload.eventCid} not found`);
      return;
    }
    await this.searchService.indexes.events.put({
      cid: event.cid,
      title: event.title,
      _id: event.cid,
      description: event.description,
      tags: event.tags.map((tag) => ({ cid: tag.cid, label: tag.label })),
      ageLimit: event.ageLimit,
      locality: event.locality,
      country: event.country,
      endTime: event.endTime,
      startTime: event.startTime,
    });
    console.log(`Search cache updated for event: ${payload.eventCid}`);
  }
}
