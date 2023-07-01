import { MainAppDatabase } from '@app/database';
import { MicroServiceName } from '@app/types';
import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DashboardJwtService } from './dashboard-jwt';
import { FacebookStrategy } from './facebook-auth';
import { JwtService } from './jwt';

export interface IAuthModuleConfig {
  microserviceName: MicroServiceName;
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

const jwtServicesMap: Record<MicroServiceName, Type<any>[]> = {
  'auth-service': [JwtService, FacebookStrategy],
  'events-fetcher': [JwtService, DashboardJwtService],
  'location-service': [JwtService],
  'main-app': [JwtService],
};
