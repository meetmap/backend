import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: RedisService.name,
      useClass: RedisService,
    },
  ],
  exports: [
    {
      provide: RedisService.name,
      useClass: RedisService,
    },
  ],
})
export class RedisModule {}
