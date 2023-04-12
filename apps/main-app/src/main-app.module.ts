import { Module } from '@nestjs/common';
import { MainAppController } from './main-app.controller';
import { MainAppService } from './main-app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MainAppController],
  providers: [MainAppService],
})
export class MainAppModule {}
