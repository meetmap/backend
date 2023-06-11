import { MainAppDatabase } from '@app/database';
import { MicroServiceName } from '@app/types';
import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { DashboardJwtService } from './dashboard-jwt';
import { JwtService } from './jwt';

export interface IAuthModuleConfig {
  microserviceName: MicroServiceName;
}

export class AuthModule {
  static init(config: IAuthModuleConfig): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      providers: jwtServicesMap[config.microserviceName],
      exports: jwtServicesMap[config.microserviceName],
    };
  }
}

const jwtServicesMap: Record<MicroServiceName, Type<any>[]> = {
  'auth-service': [JwtService],
  'events-fetcher': [JwtService, DashboardJwtService],
  'location-service': [JwtService],
  'main-app': [JwtService],
};
