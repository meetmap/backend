import { UpdateUserLocationRequestDto } from '@app/dto/location-service/location.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { LocationDal } from './location.dal';

@Injectable()
export class LocationService {
  constructor(private readonly dal: LocationDal) {}

  public async updateUserLocation(
    cid: string,
    dto: UpdateUserLocationRequestDto,
  ) {
    const user = await this.dal.getUserByCId(cid);
    if (!user) {
      throw new ForbiddenException('Invalid user');
    }
    return await this.dal.updateUserLocation(user.cid, {
      lat: dto.lat,
      lng: dto.lng,
    });
  }
  public async getFriendsLocation(cid: string) {
    const userFriends = await this.dal.getUserFriendsCIds(cid);
    if (!userFriends) {
      throw new ForbiddenException('Invalid user');
    }
    return await this.dal.getUsersLocationBulk(userFriends);
  }
}
