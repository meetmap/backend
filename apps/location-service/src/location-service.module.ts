import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';

import { LocationModule } from './location/location.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from '@app/rabbitmq';
import { InternalAxiosModule } from '@app/axios';
import { LocationServiceController } from './location-service.controller';
import { DatabaseModule } from '@app/database';
import { UsersModule } from './users/users.module';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.init({
      connectionStringEnvPath: 'LOCATION_SERVICE_DATABASE_URL',
      microserviceName: 'location-service',
    }),
    AuthModule,
    RedisModule,
    // InternalAxiosModule,
    RabbitmqModule.forRoot(),
    UsersModule,
    LocationModule,
  ],
  controllers: [LocationServiceController],
})
export class LocationServiceModule {}
