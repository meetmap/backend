import {
  GetUserWithLocationResponseDto,
  UpdateUserLocationRequestDto,
} from '@app/dto/location-service/location.dto';
import { ICoordinates, ILocationServiceUser } from '@app/types';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { LocationDal } from './location.dal';

@Injectable()
export class LocationService {
  constructor(private readonly dal: LocationDal) {}

  public async updateUserLocation(
    cid: string,
    dto: UpdateUserLocationRequestDto,
  ) {
    const user = await this.dal.getUserByCid(cid);
    if (!user) {
      throw new ForbiddenException('Invalid user');
    }
    const updatedLocation = await this.dal.updateUserLocation(user.cid, {
      lat: dto.lat,
      lng: dto.lng,
    });
    return LocationService.mapUserToUserWithLocation(
      user,
      updatedLocation.location,
    );
  }
  public async getFriendsLocation(
    cid: string,
  ): Promise<GetUserWithLocationResponseDto[]> {
    const userFriends = await this.dal.getSelfUserFriends(cid);

    if (!userFriends) {
      throw new ForbiddenException('Invalid user');
    }
    const locations = await this.dal.getUsersLocationBulk(
      userFriends.map((user) => user.cid),
    );

    return userFriends.map((user, index) =>
      LocationService.mapUserToUserWithLocation(
        user,
        locations[index]?.location ?? null,
      ),
    );
  }

  static mapUserToUserWithLocation(
    user: ILocationServiceUser,
    coordinates: ICoordinates | null,
  ): GetUserWithLocationResponseDto {
    return {
      cid: user.cid,
      id: user.id,
      location: coordinates,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
    };
  }
}
