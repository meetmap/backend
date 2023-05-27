import { Body, Controller, Post } from '@nestjs/common';
import {
  RabbitRPC,
  RabbitPayload,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { RabbitMQExchanges } from '@app/constants';
import { LocationService } from './location.service';
import {
  GetUsersLocationRequestDto,
  GetUserLocationResponseDto,
  UpdateUserLocationRequestDto,
} from './dto';
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @RabbitRPC({
    exchange: RabbitMQExchanges.LOCATION_EXCHANGE,
    routingKey: 'update-location',
  })
  public async updateUserLocation(
    @RabbitPayload() payload: UpdateUserLocationRequestDto,
  ): Promise<GetUserLocationResponseDto> {
    return this.locationService.updateUserLocation(payload);
  }

  @RabbitRPC({
    exchange: RabbitMQExchanges.LOCATION_EXCHANGE,
    routingKey: 'get-users-location',
  })
  public async getUsersLocation(
    @RabbitPayload() dto: GetUsersLocationRequestDto,
  ): Promise<GetUserLocationResponseDto[]> {
    return await this.locationService.getUsersLocation(dto);
  }
}
