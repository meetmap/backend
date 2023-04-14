import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQExchanges } from '@app/constants';
import { LocationService } from './location.service';
import { LocationDal } from './location.dal';

@Module({
  imports: [],
  providers: [LocationService, LocationDal],
  controllers: [LocationController],
})
export class LocationModule {}
