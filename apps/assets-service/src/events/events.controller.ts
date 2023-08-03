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
    queue: RMQConstants.exchanges.EVENTS.queues.ASSETS_SERVICE,
  })
  public async handleEvent(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.EventsServiceEventRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleEvent.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      if (
        routingKey === RMQConstants.exchanges.EVENTS.routingKeys.EVENT_CREATED
      ) {
        await this.usersService.handleCreateEvent(payload);
        return;
      } else {
        throw new Error('Invalid routing key');
      }
    } catch (error) {
      console.error(error);
    }
  }
}
