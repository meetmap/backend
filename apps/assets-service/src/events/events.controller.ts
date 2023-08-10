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
    routingKey: [RMQConstants.exchanges.EVENTS.routingKeys.EVENT_CREATED],
    queue: 'assets-service.events.created',
  })
  public async handleCreateEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventsServiceEventRequestDto,
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
