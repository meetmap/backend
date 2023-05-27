import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';

import { LocationModule } from './location/location.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQExchanges } from '@app/constants';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from '@app/rabbitmq';
import { InternalAxiosModule } from '@app/axios';
import { LocationServiceController } from './location-service.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    InternalAxiosModule,
    RabbitmqModule.forRoot(),
    LocationModule,
  ],
  controllers: [LocationServiceController],
})
export class LocationServiceModule {}
