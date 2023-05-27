import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthDal } from './auth.dal';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, AuthDal],
  controllers: [AuthController],
})
export class AuthModule {}
