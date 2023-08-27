import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
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
  constructor(private readonly usersService: EventsService) {}

  ///handlers for rmq

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENTS.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
    ],
    queue: 'assets-service.events.created',
  })
  public async handleCreateEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.CreateEventPayload,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleCreateEvent.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      await this.usersService.handleCreateEvent(payload);
      return;
    } catch (error) {
      console.error(error);
    }
  }
}
