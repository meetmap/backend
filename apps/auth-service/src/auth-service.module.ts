import { AuthModule as LibAuthModule } from '@app/auth';
import { InternalAxiosModule } from '@app/axios';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceController } from './auth-service.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.init({
      connectionStringEnvPath: 'AUTH_SERVICE_DATABASE_URL',
      microserviceName: 'auth-service',
    }),
    RabbitmqModule.forRoot(),
    InternalAxiosModule,
    LibAuthModule,
    AuthModule,
  ],
  controllers: [AuthServiceController],
  providers: [],
})
export class AuthServiceModule {}
