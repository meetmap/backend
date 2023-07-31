import { AppTypes } from '@app/types';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthServiceDatabase,
  EventsServiceDatabase,
  LocationServiceDatabase,
  UsersServiceDatabase,
} from './databases';
import { AbstractBaseDatabase } from './databases/abstract.db';
import { AssetsServiceDatabase } from './databases/assets-service';
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
  [AppTypes.Other.Microservice.MicroServiceName.EVENTS_SERVICE]:
    EventsServiceDatabase,
  [AppTypes.Other.Microservice.MicroServiceName.LOCATION_SERVICE]:
    LocationServiceDatabase,
  [AppTypes.Other.Microservice.MicroServiceName.USERS_SERVICE]:
    UsersServiceDatabase,
  [AppTypes.Other.Microservice.MicroServiceName.AUTH_SERVICE]:
    AuthServiceDatabase,
  [AppTypes.Other.Microservice.MicroServiceName.ASSETS_SERVICE]:
    AssetsServiceDatabase,
};
