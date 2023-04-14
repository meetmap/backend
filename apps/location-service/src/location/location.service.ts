import { Injectable } from '@nestjs/common';
import { GetUsersLocationDto, UpdateUserLocationDto } from './dto';
import { LocationDal } from './location.dal';

@Injectable()
export class LocationService {
  constructor(private readonly dal: LocationDal) {}

  public async updateUserLocation(dto: UpdateUserLocationDto) {
    return await this.dal.updateUserLocation(dto.userId, {
      lat: dto.lat,
      lng: dto.lng,
    });
  }
  public async getUsersLocation(dto: GetUsersLocationDto) {
    return await this.dal.getUsersLocationBulk(dto.userIds);
  }
}
