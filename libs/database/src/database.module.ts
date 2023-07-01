import './mongoose-defaults';
import { MicroServiceName } from '@app/types';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthServiceDatabase,
  EventsFetcherDb,
  MainAppDatabase,
  LocationServiceDatabase,
} from './databases';

import { BaseDatabase } from './databases/types';

export interface IDatabaseModuleConfig {
  connectionStringEnvPath: string;
  microserviceName: MicroServiceName;
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

const microserviceDatabaseMap: Record<MicroServiceName, typeof BaseDatabase> = {
  'events-fetcher': EventsFetcherDb,
  'location-service': LocationServiceDatabase,
  'main-app': MainAppDatabase,
  'auth-service': AuthServiceDatabase,
};
