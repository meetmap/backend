import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';

import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { ConfigModule } from '@nestjs/config';
import { LocationServiceController } from './location-service.controller';
import { LocationModule } from './location/location.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.init({
      connectionStringEnvPath: 'LOCATION_SERVICE_DATABASE_URL',
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.LOCATION_SERVICE,
    }),
    AuthModule.init({
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.LOCATION_SERVICE,
    }),
    RedisModule,
    // InternalAxiosModule,
    RabbitmqModule.forRoot(),
    UsersModule,
    LocationModule,
    SnapshotModule,
  ],
  controllers: [LocationServiceController],
})
export class LocationServiceModule {}
