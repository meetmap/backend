import { UseApiAuthGuard } from '@app/auth/api-auth';
import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import {
  Nack,
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { EventsProcessingService } from './events-processing.service';

@Controller('events-processing')
export class EventsProcessingController {
  constructor(
    private readonly eventsProcessingService: EventsProcessingService,
  ) {}

  @Post('/upload/user-event')
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventProcessing
      .EventProcessingStatusResponseDto,
  })
  @UseMicroserviceAuthGuard()
  public async initUploadUserEventFlow(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Body()
    payload: AppDto.EventsServiceDto.EventProcessing.CreateUserEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto> {
    return await this.eventsProcessingService.initUploadUserEventFlow(
      jwtPayload.cid,
      payload,
    );
  }

  @Post('/update/user-event')
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventProcessing
      .EventProcessingStatusResponseDto,
  })
  @UseMicroserviceAuthGuard()
  public async initUpdateUserEventFlow(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Body()
    payload: AppDto.EventsServiceDto.EventProcessing.UpdateUserEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto> {
    return await this.eventsProcessingService.initUpdateUserEventFlow(
      jwtPayload.cid,
      payload,
    );
  }

  @Post('/upload/ticketing-platform-event')
  @UseApiAuthGuard()
  public async initUploadTicketingPlatformEventFlowRequest() {
    throw new Error('Not implemented');
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey:
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_REQUESTED,
    queue: 'events-service.processing.create-request',
  })
  public async initUploadTicketingPlatformEventFlowInternal(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.CreateTicketingPlatformEventRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    console.log('Create', req.fields.routingKey);
    try {
      await this.eventsProcessingService.initUploadTicketingPlatformEventFlow(
        payload,
        payload.creator?.creatorCid,
      );
    } catch (error) {
      console.log(error);
      // return new Nack(false);
    }
  }

  @Post('/update/ticketing-platform-event')
  @UseApiAuthGuard()
  public async initUpdateTicketingPlatformEventFlowRequest() {
    throw new Error('Not implemented');
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_UPDATE_REQUESTED,
    ],
    queue: 'events-service.processing.update-request',
  })
  public async initUpdateTicketingPlatformEventFlowInternal(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.UpdateTicketingPlatformEventRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    console.log('Update', req.fields.routingKey);
    try {
      await this.eventsProcessingService.initUpdateTicketingPlatformEventFlow(
        payload,
        payload.creator?.creatorCid,
      );
    } catch (error) {
      console.log(error);
      // return new Nack(false);
    }
  }

  //handlers here

  @Get('/processing/status-check/:processingCid')
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventProcessing
      .EventProcessingStatusResponseDto,
  })
  @UseMicroserviceAuthGuard()
  public async checkEventUploadStatus(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Param('processingCid') processingCid: string,
  ): Promise<AppDto.EventsServiceDto.EventProcessing.EventProcessingStatusResponseDto> {
    return await this.eventsProcessingService.checkEventProcessingStatus(
      jwtPayload.cid,
      processingCid,
    );
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
    ],
    queue: 'events-service.processing.create',
  })
  public async createEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.CreateEventPayload,
  ) {
    try {
      await this.eventsProcessingService.createEvent(payload);
    } catch (error) {
      let reason = 'Event creation failed: Unknown error';
      if (error instanceof Error) {
        reason = error.message;
      }
      await this.eventsProcessingService.publishFailedStatus(
        payload.processingCid,
        reason,
      );
      // return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_UPDATE_INITIALIZED,
    ],
    queue: 'events-service.processing.update',
  })
  public async updateEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.UpdateEventPayload,
  ) {
    try {
      await this.eventsProcessingService.updateEvent(payload);
    } catch (error) {
      let reason = 'Event update failed: Unknown error';
      if (error instanceof Error) {
        reason = error.message;
      }
      await this.eventsProcessingService.publishFailedStatus(
        payload.processingCid,
        reason,
      );
      // return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_EVENT_CREATED,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_EVENT_UPDATED,
    ],
    queue: 'events-service.processing.moderate',
  })
  public async moderateEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventProcessingStepRequestDto,
  ) {
    try {
      await this.eventsProcessingService.moderateEvent(payload.processingCid);
    } catch (error) {
      let reason = 'Moderation failed: Unknown error';
      if (error instanceof Error) {
        reason = error.message;
      }
      await this.eventsProcessingService.publishFailedStatus(
        payload.processingCid,
        reason,
      );
      // return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_MODERATED,
    ],
    queue: 'events-service.processing.assign-tags',
  })
  public async assignEventTags(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventProcessingStepRequestDto,
  ) {
    try {
      await this.eventsProcessingService.assignEventTags(payload.processingCid);
    } catch (error) {
      let reason = 'Assigning tags failed: Unknown error';
      if (error instanceof Error) {
        reason = error.message;
      }
      await this.eventsProcessingService.publishFailedStatus(
        payload.processingCid,
        reason,
      );
      // return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_ASSIGN_TAGS_ONLY,
    ],
    queue: 'events-service.processing.assign-tags-only',
  })
  public async assignEventTagsOnly(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventRequestDto,
  ) {
    try {
      await this.eventsProcessingService.assignEventTagsOnly(payload.eventCid);
    } catch (error) {
      console.log(error);
      return new Nack(false);
    }
  }

  //FINAL PROCESSING HANDLERS

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_TAGS_ASSIGNED,
    ],
    queue: 'events-service.processing.succeed',
  })
  public async eventProcessingSucceed(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventProcessingStepRequestDto,
  ) {
    try {
      await this.eventsProcessingService.eventProcessingSucceed(
        payload.processingCid,
      );
    } catch (error) {
      console.log(error);
      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_FAILED,
    ],
    queue: 'events-service.processing.handled-fail',
  })
  public async eventProcessingFailed(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventProcessingStepRequestDto,
  ) {
    try {
      await this.eventsProcessingService.eventProcessingFailed(
        payload.processingCid,
        payload.failureReason ?? 'Unknown error',
      );
    } catch (error) {
      console.log(error);
      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey:
      RMQConstants.exchanges.ASSETS.routingKeys
        .ASSETS_PROCESSING_EVENT_ASSETS_READY_TO_ATTACH,
    queue: 'events-service.processing.attach-assets',
  })
  public async attachAssetsToEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.EventAssetsReadyToAttachDto,
  ) {
    await this.eventsProcessingService.attachAssetsToEvent(
      payload.eventCid,
      payload.assets,
    );
  }

  //JOBS HERE

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey: [
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTS_PROCESSING_REQUEST,
    ],
    queue: 'events-service.processing.events.without-tags-job',
  })
  public async processEventsWithoutTagsJob() {
    try {
      return await this.eventsProcessingService.processEventsWithoutTagsJob();
    } catch (error) {
      console.log(error);
    }
  }
}
