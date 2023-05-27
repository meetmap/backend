import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQExchanges } from '@app/constants';
import { InternalAxiosModule } from '@app/axios';
import { MainAppController } from './main-app.controller';

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
    InternalAxiosModule,
    AuthModule,
    UsersModule,
    FriendsModule,
  ],
  controllers: [MainAppController],
})
export class MainAppModule {}
