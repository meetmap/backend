import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { S3UploaderModule } from '@app/s3-uploader';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FriendsModule } from './friends/friends.module';
import { MainAppController } from './main-app.controller';
import { UsersModule } from './users/users.module';
import { SnapshotModule } from './snapshot/snapshot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.init({
      connectionStringEnvPath: 'MAIN_APP_DATABASE_URL',
      microserviceName: 'main-app',
    }),
    RabbitmqModule.forRoot(),
    // InternalAxiosModule,
    AuthModule.init({
      microserviceName: 'main-app',
    }),
    S3UploaderModule,
    UsersModule,
    FriendsModule,
    SnapshotModule,
  ],
  controllers: [MainAppController],
})
export class MainAppModule {}
