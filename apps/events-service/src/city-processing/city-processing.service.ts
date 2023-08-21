import { Injectable } from '@nestjs/common';
import { CityProcessingDal } from './city-processing.dal';

@Injectable()
export class CityProcessingService {
  constructor(private readonly dal: CityProcessingDal) {}
  public async getAllCities() {
    await this.dal.updateCities();
    return await this.dal.getAllCities();
  }
}
