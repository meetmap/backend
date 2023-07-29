import { AuthModule as LibAuthModule } from '@app/auth';
import { AuthProvidersModule } from '@app/auth-providers';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceController } from './auth-service.controller';
import { AuthModule } from './auth/auth.module';
import { SnapshotModule } from './snapshot/snapshot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.init({
      connectionStringEnvPath: 'AUTH_SERVICE_DATABASE_URL',
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.AUTH_SERVICE,
    }),
    RabbitmqModule.forRoot(),
    // InternalAxiosModule,
    LibAuthModule.init({
      microserviceName:
        AppTypes.Other.Microservice.MicroServiceName.AUTH_SERVICE,
    }),
    AuthProvidersModule,
    AuthModule,
    SnapshotModule,
  ],
  controllers: [AuthServiceController],
  providers: [],
})
export class AuthServiceModule {}
