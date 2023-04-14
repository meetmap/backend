import { RedisService } from '@app/redis';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LocationDal {
  constructor(
    @Inject(RedisService.name) private readonly redisClient: RedisService<{}>,
  ) {}
}
