import { Controller } from '@nestjs/common';
import { RabbitRPC, RabbitPayload } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQExchanges, RabbitMQQueues } from '@app/constants';
import { LocationService } from './location.service';
@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
}
