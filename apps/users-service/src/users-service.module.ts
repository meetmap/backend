import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { S3UploaderModule } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FriendsModule } from './friends/friends.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { MainAppController } from './users-service.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.init({
      connectionStringEnvPath: 'USERS_SERVICE_DATABASE_URL',
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.USERS_SERVICE,
    }),
    RabbitmqModule.forRoot(),
    // InternalAxiosModule,
    AuthModule.init({
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.USERS_SERVICE,
    }),
    S3UploaderModule,
    UsersModule,
    FriendsModule,
    SnapshotModule,
  ],
  controllers: [MainAppController],
})
export class MainAppModule {}
