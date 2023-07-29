import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { LocationDal } from './location.dal';

@Injectable()
export class LocationService {
  constructor(private readonly dal: LocationDal) {}

  public async updateUserLocation(
    cid: string,
    dto: AppDto.LocationServiceDto.LocationDto.UpdateUserLocationRequestDto,
  ) {
    const user = await this.dal.getUserByCid(cid);
    if (!user) {
      throw new ForbiddenException('Invalid user');
    }
    const updatedLocation = await this.dal.updateUserLocation(user.cid, {
      lat: dto.lat,
      lng: dto.lng,
    });
    return LocationService.mapUserToUserWithLocation(user, updatedLocation);
  }
  public async getFriendsLocation(
    cid: string,
  ): Promise<
    AppDto.LocationServiceDto.LocationDto.GetUserWithLocationResponseDto[]
  > {
    const userFriends = await this.dal.getSelfUserFriends(cid);

    if (!userFriends) {
      throw new ForbiddenException('Invalid user');
    }
    const locations = await this.dal.getUsersLocationBulk(
      userFriends.map((user) => user.cid),
    );

    return userFriends.map((user, index) =>
      LocationService.mapUserToUserWithLocation(user, locations[index]),
    );
  }

  static mapUserToUserWithLocation(
    user: AppTypes.LocationService.Users.IUser,
    userLocation: AppTypes.LocationService.Users.ILocation,
  ): AppDto.LocationServiceDto.LocationDto.GetUserWithLocationResponseDto {
    return {
      cid: user.cid,
      id: user.id,
      location: userLocation.location,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      locationUpdatedAt: userLocation.updatedAt,
    };
  }
}
