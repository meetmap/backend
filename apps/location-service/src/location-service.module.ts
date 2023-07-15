import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';

import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { ConfigModule } from '@nestjs/config';
import { LocationServiceController } from './location-service.controller';
import { LocationModule } from './location/location.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.init({
      connectionStringEnvPath: 'LOCATION_SERVICE_DATABASE_URL',
      microserviceName: 'location-service',
    }),
    AuthModule.init({
      microserviceName: 'location-service',
    }),
    RedisModule,
    // InternalAxiosModule,
    RabbitmqModule.forRoot(),
    UsersModule,
    LocationModule,
  ],
  controllers: [LocationServiceController],
})
export class LocationServiceModule {}
