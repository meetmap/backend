import { AiProcessingService } from '@app/ai-processing';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventsProcessingDal } from './events-processing.dal';

@Injectable()
export class EventsProcessingService {
  constructor(
    private readonly dal: EventsProcessingDal,
    private readonly aiProcessing: AiProcessingService,
    private readonly rmqService: RabbitmqService,
  ) {}

  public async initUploadUserEventFlow(
    userCid: string,
    payload: AppDto.EventsServiceDto.EventProcessing.CreateUserEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto> {
    if (new Date(payload.startTime) > new Date(payload.endTime)) {
      throw new BadRequestException("Event start time can't be after end time");
    }
    if (new Date(payload.startTime).getTime() < Date.now()) {
      throw new BadRequestException("Event can't start in past");
    }
    //check for already uploading one
    const activeUpload = await this.dal.getUserActiveProcessing(userCid);
    if (activeUpload) {
      throw new ForbiddenException(
        'Already uploading, try again once upload finished',
      );
    }

    const { upload, transport } = await this.dal.initUserEventUpload(
      userCid,
      payload,
    );
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
      transport,
    );

    return AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto.create(
      {
        cid: upload.cid,
        current: upload.status,
        next:
          AppTypes.EventsService.EventProcessing.getNextProcessingStatus(
            upload.status,
          )[0] ?? undefined,
        type: upload.type,
      },
    );
  }

  public async initUploadTicketingPlatformEventFlow(
    payload: AppDto.TransportDto.Events.CreateTicketingPlatformEventRequestDto,
    platformCid?: string,
  ) {
    if (new Date(payload.startTime) > new Date(payload.endTime)) {
      throw new BadRequestException("Event start time can't be after end time");
    }
    // if (new Date(payload.startTime).getTime() < Date.now()) {
    //   throw new BadRequestException("Event can't start in past");
    // }

    const { upload, transport } =
      await this.dal.initTicketingPlatformEventUpload(payload, platformCid);
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
      transport,
    );

    return AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto.create(
      {
        cid: upload.cid,
        current: upload.status,
        next:
          AppTypes.EventsService.EventProcessing.getNextProcessingStatus(
            upload.status,
          )[0] ?? undefined,
        type: upload.type,
      },
    );
  }

  public async initUpdateUserEventFlow(
    userCid: string,
    payload: AppDto.EventsServiceDto.EventProcessing.UpdateUserEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto> {
    const dbEvent = await this.dal.getEventByCid(payload.cid);
    if (!dbEvent) {
      throw new NotFoundException('Event not found');
    }
    if (userCid !== dbEvent.creator?.creatorCid) {
      throw new ForbiddenException('Not a creator of the event');
    }
    if (
      payload.startTime &&
      new Date(payload.startTime).getTime() < Date.now()
    ) {
      throw new BadRequestException("Event can't start in past");
    }
    if (
      new Date(payload.startTime ?? dbEvent.startTime) >
      new Date(payload.endTime ?? dbEvent.endTime)
    ) {
      throw new BadRequestException("Event start time can't be after end time");
    } //check for already uploading one
    const activeUpload = await this.dal.getUserActiveProcessing(userCid);
    if (activeUpload) {
      throw new ForbiddenException(
        'Already processing, try again once upload finished',
      );
    }

    const { processing, transport } = await this.dal.initUserEventUpdate(
      userCid,
      payload,
    );
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_UPDATE_INITIALIZED,
      transport,
    );

    return AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto.create(
      {
        cid: processing.cid,
        current: processing.status,
        next:
          AppTypes.EventsService.EventProcessing.getNextProcessingStatus(
            processing.status,
          )[0] ?? undefined,
        type: processing.type,
      },
    );
  }

  public async initUpdateTicketingPlatformEventFlow(
    payload: AppDto.TransportDto.Events.UpdateTicketingPlatformEventRequestDto,
    platformCid?: string,
  ) {
    const dbEvent = await this.dal.getEventByCid(payload.cid);
    if (!dbEvent) {
      throw new NotFoundException('Event not found');
    }
    if (platformCid !== dbEvent.creator?.creatorCid) {
      throw new ForbiddenException('Not a creator of the event');
    }
    // if (
    //   payload.startTime &&
    //   new Date(payload.startTime).getTime() < Date.now()
    // ) {
    //   throw new BadRequestException("Event can't start in past");
    // }
    if (
      new Date(payload.startTime ?? dbEvent.startTime) >
      new Date(payload.endTime ?? dbEvent.endTime)
    ) {
      throw new BadRequestException("Event start time can't be after end time");
    } //check for already uploading one

    const { processing, transport } =
      await this.dal.initTicketingPlatformEventUpdate(payload, platformCid);
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_UPDATE_INITIALIZED,
      transport,
    );

    return AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto.create(
      {
        cid: processing.cid,
        current: processing.status,
        next:
          AppTypes.EventsService.EventProcessing.getNextProcessingStatus(
            processing.status,
          )[0] ?? undefined,
        type: processing.type,
      },
    );
  }

  // public async uploadEvent(
  //   payload: AppDto.TransportDto.Events.CreateEventPayload,
  // ) {}

  public async checkEventProcessingStatus(
    userCid: string,
    uploadCid: string,
  ): Promise<AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto> {
    const processing = await this.dal.getProcessing(uploadCid);
    if (processing?.creator?.creatorCid !== userCid) {
      throw new ForbiddenException('Can check only yours uploads');
    }
    const event = processing.eventCid
      ? await this.dal.getEventWithUserMetadataAndTags(
          userCid,
          processing.eventCid,
        )
      : undefined;
    return AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto.create(
      {
        cid: processing.cid,
        current: processing.status,
        next:
          AppTypes.EventsService.EventProcessing.getNextProcessingStatus(
            processing.status,
          )[0] ?? undefined,
        failureReason: processing.failureReason,
        //@todo return event
        event: event
          ? AppDto.EventsServiceDto.EventsDto.EventResponseDto.create({
              id: event.id,
              ageLimit: event.ageLimit,
              endTime: event.endTime,
              eventType: event.eventType,
              location: {
                countryName: event.location.country,
                localityId: event.location.localityId,
                localityName: event.location.locality,
                coordinates: event.location.coordinates,
                countryId: event.location.countryId,
              },
              slug: event.slug,
              startTime: event.startTime,
              title: event.title,
              userStats: event.userStats,
              creator: event.creator,
              description: event.description,
              thumbnail:
                event.thumbnail &&
                (event.creator
                  ? AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
                      event.thumbnail,
                      AppTypes.AssetsSerivce.Other.SizeName.S_4_3,
                    )
                  : event.thumbnail),
              // assets: event.assets,
              accessibility: event.accessibility,
              cid: event.cid,
              tags: event.tags,
            })
          : undefined,
        type: processing.type,
      },
    );
  }

  public async createEvent(
    payload: AppDto.TransportDto.Events.CreateEventPayload,
  ) {
    const event = await this.dal.createEvent(payload);
    const processing = await this.dal.updateProcessingStatus(
      payload.processingCid,
      AppTypes.EventsService.EventProcessing.ProcessingStatus.EVENT_CREATED,
    );

    if (!processing) {
      throw new Error('Processing not found');
    }

    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_EVENT_CREATED,
      AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
        processingCid: payload.processingCid,
        type: processing.type,
        eventCid: processing.eventCid,
      }),
    );

    return event;
  }

  public async updateEvent(
    payload: AppDto.TransportDto.Events.UpdateEventPayload,
  ) {
    const event = await this.dal.updateEvent(payload);
    const processing = await this.dal.updateProcessingStatus(
      payload.processingCid,
      AppTypes.EventsService.EventProcessing.ProcessingStatus.EVENT_UPDATED,
    );

    if (!processing) {
      throw new Error('Processing not found');
    }

    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_EVENT_UPDATED,
      AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
        processingCid: payload.processingCid,
        type: processing.type,
        eventCid: processing.eventCid,
      }),
    );
    return event;
  }

  public async moderateEvent(processingCid: string) {
    const event = await this.dal.getEventByProcessingCid(processingCid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    //if moderation failed just throw error
    // throw new BadRequestException('Moderation failed');
    ///succeed
    const processing = await this.dal.updateProcessingStatus(
      processingCid,
      AppTypes.EventsService.EventProcessing.ProcessingStatus.MODERATED,
    );
    if (!processing) {
      throw new Error('Processing not found');
    }

    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_MODERATED,
      AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
        processingCid: processingCid,
        type: processing.type,
        eventCid: processing.eventCid,
      }),
    );
  }

  public async assignEventTags(processingCid: string) {
    const event = await this.dal.getEventByProcessingCid(processingCid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const processing = await this.dal.getProcessing(processingCid);
    if (!processing) {
      throw new Error('Processing not found');
    }

    if (event.tagsCids.length) {
      const tagsCids = await this.generateFiltersMetadata(event);
      await this.dal.assignTagsToEvent(event.cid, tagsCids);

      await this.dal.updateProcessingStatus(
        processingCid,
        AppTypes.EventsService.EventProcessing.ProcessingStatus.TAGS_ASSIGNED,
      );

      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENT_PROCESSING.name,
        RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
          .EVENT_PROCESSING_TAGS_ASSIGNED,
        AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
          processingCid: processingCid,
          type: processing.type,
          eventCid: processing.eventCid,
        }),
      );
      return event;
    }

    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_TAGS_ASSIGNED,
      AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
        processingCid: processingCid,
        type: processing.type,
        eventCid: processing.eventCid,
      }),
    );
  }

  public async processEventsWithoutTagsJob() {
    const eventsCursor = this.dal.getEventsWithoutTagsCursor();
    for await (const event of eventsCursor) {
      const eventObject = event.toObject();
      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENT_PROCESSING.name,
        RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
          .EVENT_PROCESSING_ASSIGN_TAGS_ONLY,
        AppDto.TransportDto.Events.EventRequestDto.create({
          eventCid: eventObject.cid,
        }),
      );
    }
  }

  public async assignEventTagsOnly(eventCid: string) {
    const event = await this.dal.getEventByCid(eventCid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const tagsCids = await this.generateFiltersMetadata(event);
    await this.dal.assignTagsToEvent(event.cid, tagsCids);

    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_CHANGED_OR_CREATED,
      AppDto.TransportDto.Events.EventRequestDto.create({
        eventCid: event.cid,
      }),
    );
  }

  public async publishFailedStatus(processingCid: string, reason: string) {
    const processing = await this.dal.getProcessing(processingCid);
    if (!processing) {
      throw new Error('Processing not found');
    }
    return await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_FAILED,
      AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
        processingCid: processingCid,
        failureReason: reason,
        type: processing.type,
        eventCid: processing.eventCid,
      }),
    );
  }

  public async eventProcessingSucceed(processingCid: string) {
    const processing = await this.dal.updateProcessingStatus(
      processingCid,
      AppTypes.EventsService.EventProcessing.ProcessingStatus.SUCCEEDED,
    );
    if (!processing) {
      throw new Error('Processing not found');
    }
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_SUCCEEDED,
      AppDto.TransportDto.Events.EventProcessingStepRequestDto.create({
        processingCid: processingCid,
        type: processing.type,
        eventCid: processing.eventCid,
      }),
    );
    const event = await this.dal.getEventByProcessingCid(processingCid);
    if (!event) {
      return;
    }
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_CHANGED_OR_CREATED,
      AppDto.TransportDto.Events.EventRequestDto.create({
        eventCid: event.cid,
      }),
    );
  }

  public async eventProcessingFailed(processingCid: string, reason: string) {
    await this.dal.updateFailedProcessingStep(processingCid, reason);
  }

  /**
   *
   * @returns tagsCids[]
   */
  private async generateFiltersMetadata(
    event: AppTypes.EventsService.Event.IEvent,
  ) {
    // try {
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

    const promptTemplate = `
          event:{
            event_description: ${event.description},
            event_origin: ${event.location.countryId},
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
    // } catch (error) {
    //   console.warn(`Failed to generate tags for event:${event.cid}`)
    //   return []
    // }
    // return JSON.parse(aiResponse);
  }

  public async attachAssetsToEvent(
    eventCid: string,
    assets: AppDto.TransportDto.Assets.EventAssetsReadyToAttachDto['assets'],
  ) {
    await this.dal.attachAssetsToEvent(eventCid, assets);
  }
}
