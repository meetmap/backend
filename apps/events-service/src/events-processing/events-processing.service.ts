import { AiProcessingService } from '@app/ai-processing';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsProcessingDal } from './events-processing.dal';

@Injectable()
export class EventsProcessingService {
  constructor(
    private readonly dal: EventsProcessingDal,
    private readonly aiProcessing: AiProcessingService,
    private readonly rmqService: RabbitmqService,
  ) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENTS.name,
    routingKey: [
      RMQConstants.exchanges.EVENTS.routingKeys.EVENT_CREATED,
      RMQConstants.exchanges.EVENTS.routingKeys.ASSIGN_TAGS,
    ],
    queue: 'events-service.events-processing.process',
  })
  public async processEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventsServiceEventRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    try {
      const event = await this.dal.getEventByCid(payload.cid);
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      //@todo validate event on harassment here
      await this.validateEvent(event);
      if (event.tagsCids.length) {
        return;
      }
      const tagsCids = await this.generateFiltersMetadata(event);
      await this.dal.assignTagsToEvent(event.cid, tagsCids);
      console.log(
        `Successfully assigned ${tagsCids.length} tags to event ${event.cid}`,
      );
      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENTS.name,
        RMQConstants.exchanges.EVENTS.routingKeys.EVENT_PROCESSING_SUCCEED,
        AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
          cid: payload.cid,
          creator: payload.creator,
        }),
      );
    } catch (error) {
      console.error(error);
      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENTS.name,
        RMQConstants.exchanges.EVENTS.routingKeys.EVENT_PROCESSING_FAILED,
        AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
          cid: payload.cid,
          creator: payload.creator,
        }),
      );
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey: [
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTS_PROCESSING_REQUEST,
    ],
    queue: 'events-service.processing.events',
  })
  public async processEventsWithoutTagsJob() {
    const eventsCursor = this.dal.getEventsWithoutTagsCursor();
    for await (const event of eventsCursor) {
      const eventObject = event.toObject();
      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENTS.name,
        RMQConstants.exchanges.EVENTS.routingKeys.ASSIGN_TAGS,
        AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
          cid: eventObject.cid,
          creator: eventObject.creator,
        }),
      );
    }
  }

  public async validateEvent(event: AppTypes.EventsService.Event.IEvent) {}

  /**
   *
   * @returns tagsCids[]
   */
  public async generateFiltersMetadata(
    event: AppTypes.EventsService.Event.IEvent,
  ) {
    const tags = await this.dal.getEventsTags();
    const systemPrompt = `
      Generate min 1 and max 15 tags for input event:
      {
        event_description: String,
        event_origin: String,
        event_title: String,
        event_age_limit: String,
      }
      Output should be in JSON format, without comments, etc. Output format:
      {
        tags: Enum(${tags.map((tag) => `"${tag}"`).join(', ')})[]
      }
    `;
    // const systemPrompt = `
    //   Generate filters for input event:
    //   {
    //     event_description: String,
    //     event_origin: String,
    //     event_title: String,
    //     event_age_limit: String,
    //   }
    //   Output should be in JSON format, without comments, etc. Output format:
    //   {
    //     filters: {
    //       age: Enum("All Ages", "18+", "21+"),
    //       event_type: Enum("Clubbing", "Concerts", "Sports", "Festivals", "Art Exhibitions", "Theater Performances", "Workshops/Seminars", "Conferences")[] #at least on element,
    //       event_features: Enum("Drinks", "Food", "Live Music", "Guest Speakers", "Interactive Activities", "Outdoor Events", "Indoor Events")[] #at least on element,
    //       genre: Enum("Comedy", "Horror", "Drama", "Musical", "Romance", "Action", "Sci-Fi", "Hip-Hop")[] #at least on element,
    //       environment: Enum("Family-friendly", "Adults Only", "Pet-friendly")[] #at least on element
    //     }
    //   }
    // `;
    const promptTemplate = `
      event:{
        event_description: ${event.description},
        event_origin: ${event.location.country},
        event_title: ${event.title},
        event_age_limit: ${event.ageLimit},
      }
    `;

    const aiResponse = await this.aiProcessing.sendAiRequest(
      systemPrompt,
      promptTemplate,
    );

    const promptTags =
      await AppDto.PromptsDto.EventsService.TagPromptResponseDto.createAndValidate<AppTypes.Prompts.EventsService.ITagsPromptResponse>(
        JSON.parse(aiResponse),
      );

    return await this.dal.getTagsCids(promptTags.tags);
    // return JSON.parse(aiResponse);
  }
}
