import { MainAppDatabase } from '@app/database';
import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt';

@Global()
@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class AuthModule {}
