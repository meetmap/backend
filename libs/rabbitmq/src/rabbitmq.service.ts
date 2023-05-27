import { AmqpConnection } from '@app/rmq-lib';
import { Injectable } from '@nestjs/common';
// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
@Injectable()
export class RabbitmqService {
  constructor(public readonly amqp: AmqpConnection) {}
}
