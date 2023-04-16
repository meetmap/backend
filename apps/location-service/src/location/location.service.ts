import { Injectable } from '@nestjs/common';
import {
  GetUsersLocationRequestDto,
  UpdateUserLocationRequestDto,
} from './dto';
import { LocationDal } from './location.dal';

@Injectable()
export class LocationService {
  constructor(private readonly dal: LocationDal) {}

  public async updateUserLocation(dto: UpdateUserLocationRequestDto) {
    return await this.dal.updateUserLocation(dto.userId, {
      lat: dto.lat,
      lng: dto.lng,
    });
  }
  public async getUsersLocation(dto: GetUsersLocationRequestDto) {
    return await this.dal.getUsersLocationBulk(dto.userIds);
  }
}
