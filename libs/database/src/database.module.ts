import { AppTypes } from '@app/types';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthServiceDatabase,
  EventsFetcherDb,
  LocationServiceDatabase,
  MainAppDatabase,
} from './databases';
import { AbstractBaseDatabase } from './databases/abstract.db';
import './mongoose-defaults';

export interface IDatabaseModuleConfig {
  connectionStringEnvPath: string;
  microserviceName: AppTypes.Other.Microservice.MicroServiceName;
  // connectionString: string;
}
export class DatabaseModule {
  static init(config: IDatabaseModuleConfig): DynamicModule {
    return {
      global: true,
      module: DatabaseModule,
      providers: [
        {
          useFactory(configService: ConfigService) {
            const connectionString = configService.getOrThrow(
              config.connectionStringEnvPath,
            );
            return new microserviceDatabaseMap[config.microserviceName]({
              connectionString,
            });
          },
          provide: microserviceDatabaseMap[config.microserviceName],
          inject: [ConfigService],
        },
      ],
      exports: [microserviceDatabaseMap[config.microserviceName]],
    };
  }
}

const microserviceDatabaseMap: Record<
  AppTypes.Other.Microservice.MicroServiceName,
  typeof AbstractBaseDatabase
> = {
  'events-service': EventsFetcherDb,
  'location-service': LocationServiceDatabase,
  'users-service': MainAppDatabase,
  'auth-service': AuthServiceDatabase,
};
