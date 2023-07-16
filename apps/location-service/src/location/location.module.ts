import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationDal } from './location.dal';
import { LocationService } from './location.service';

@Module({
  imports: [],
  providers: [LocationService, LocationDal],
  controllers: [LocationController],
})
export class LocationModule {}
