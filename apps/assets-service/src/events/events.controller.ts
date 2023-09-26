import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  ///handlers for rmq

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
    ],
    queue: 'assets-service.events.create.init',
  })
  public async handleCreateEventInitialized(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.CreateEventPayload,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleCreateEventFailed.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      await this.eventsService.handleCreateEvent(payload);
      return;
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_FAILED,
    ],
    queue: 'assets-service.events.create.failed',
  })
  public async handleCreateEventFailed(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventProcessingStepRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    if (
      ![
        AppTypes.EventsService.EventProcessing.ProcessingType
          .THIRD_PARTY_EVENT_CREATE,
        AppTypes.EventsService.EventProcessing.ProcessingType
          .THIRD_PARTY_SYSTEM_EVENT_CREATE,
        AppTypes.EventsService.EventProcessing.ProcessingType.USER_EVENT_CREATE,
      ].includes(payload.type)
    ) {
      return;
    }
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleCreateEventFailed.name,
      routingKey: routingKey,
      msg: {
        cid: payload.eventCid,
      },
    });
    try {
      await this.eventsService.deleteEvent(payload.eventCid);
      return;
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey:
      RMQConstants.exchanges.ASSETS.routingKeys
        .ASSETS_PROCESSING_EVENT_ASSETS_READY_TO_ATTACH,
    queue: 'assets-service.events.attach-assets',
  })
  public async handleAttachAssetsToEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.EventAssetsReadyToAttachDto,
  ) {
    await this.eventsService.attachAssetsToEvent(
      payload.eventCid,
      payload.assets.map((asset) => asset.cid),
    );
  }
}
