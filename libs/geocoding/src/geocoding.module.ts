import { Global, Module } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';

@Global()
@Module({
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class GeocodingModule {}
