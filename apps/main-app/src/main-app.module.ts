import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQExchanges } from '@app/constants';

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
    AuthModule,
    UsersModule,
    FriendsModule,
  ],
})
export class MainAppModule {}
