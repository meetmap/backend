import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InternalAxiosService } from './internal-axios.service';

@Global()
@Module({
  providers: [InternalAxiosService],
  exports: [InternalAxiosService],
})
export class InternalAxiosModule {}
