import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersDal } from './users.dal';
import { UsersService } from './users.service';

@Module({
  imports: [],
  providers: [UsersService, UsersDal],
  controllers: [UsersController],
})
export class UsersModule {}
