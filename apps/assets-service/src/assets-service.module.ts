import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { S3UploaderModule } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetsServiceController } from './assets-service.controller';
import { AssetsUploaderModule } from './assets-uploader/assets-uploader.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitmqModule.forRoot(),
    AuthModule.init({
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.ASSETS_SERVICE,
    }),
    DatabaseModule.init({
      connectionStringEnvPath: 'ASSETS_SERVICE_DATABASE_URL',
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.ASSETS_SERVICE,
    }),
    S3UploaderModule,
    SnapshotModule,
    UserModule,
    AssetsUploaderModule,
  ],

  controllers: [AssetsServiceController],
})
export class AssetsServiceModule {}
