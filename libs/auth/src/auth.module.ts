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
        config.microserviceName === 'auth-service'
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
  'auth-service': [JwtService, FacebookStrategy],
  'events-service': [JwtService, DashboardJwtService],
  'location-service': [JwtService],
  'users-service': [JwtService],
};
