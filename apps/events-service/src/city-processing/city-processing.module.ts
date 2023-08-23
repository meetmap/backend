import { Module } from '@nestjs/common';
import { CityProcessingDal } from './city-processing.dal';
import { CityProcessingService } from './city-processing.service';
// import { TestController } from './test.controller';

@Module({
  controllers: [],
  providers: [CityProcessingDal, CityProcessingService],
})
export class CityProcessingModule {}
