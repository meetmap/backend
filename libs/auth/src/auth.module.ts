import { AppTypes } from '@app/types';
import { DynamicModule, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DashboardJwtService } from './dashboard-jwt';
import { FacebookStrategy } from './facebook-auth';
import { JwtService } from './jwt';

export interface IAuthModuleConfig {
  microserviceName: AppTypes.Other.Microservice.MicroServiceName;
}

export class AuthModule {
  static init(config: IAuthModuleConfig): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      imports:
        config.microserviceName ===
        AppTypes.Other.Microservice.MicroServiceName.AUTH_SERVICE
          ? [PassportModule.register({})]
          : [],
      providers: jwtServicesMap[config.microserviceName],
      exports: jwtServicesMap[config.microserviceName],
    };
  }
}

const jwtServicesMap: Record<
  AppTypes.Other.Microservice.MicroServiceName,
  Type<any>[]
> = {
  [AppTypes.Other.Microservice.MicroServiceName.AUTH_SERVICE]: [
    JwtService,
    FacebookStrategy,
  ],
  [AppTypes.Other.Microservice.MicroServiceName.EVENTS_SERVICE]: [
    JwtService,
    DashboardJwtService,
  ],
  [AppTypes.Other.Microservice.MicroServiceName.LOCATION_SERVICE]: [JwtService],
  [AppTypes.Other.Microservice.MicroServiceName.USERS_SERVICE]: [JwtService],
  [AppTypes.Other.Microservice.MicroServiceName.ASSETS_SERVICE]: [JwtService],
  [AppTypes.Other.Microservice.MicroServiceName.JOBS_SERVICE]: [],
};
