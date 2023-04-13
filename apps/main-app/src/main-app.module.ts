import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MainAppController } from './main-app.controller';
import { MainAppService } from './main-app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.init({
      connectionStringEnvPath: 'MAIN_APP_DATABASE_URL',
      microserviceName: 'main-app',
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [MainAppController],
  providers: [MainAppService],
})
export class MainAppModule {}
