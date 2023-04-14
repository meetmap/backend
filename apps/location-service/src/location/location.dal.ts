import { RedisService } from '@app/redis';
import { ICoordinates, IUserLocation } from '@app/types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LocationDal {
  constructor(
    @Inject(RedisService.name)
    private readonly redisClient: RedisService<IUserLocation>,
  ) {}

  public async updateUserLocation(userId: string, coordinates: ICoordinates) {
    this.redisClient.set(
      userId,
      {
        userId: userId,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      },
      {
        EX: 60 * 60, //e.g 1hr
      },
    );
    return {
      userId: userId,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
    };
  }
  public async getUserLocation(userId: string): Promise<IUserLocation | null> {
    return this.redisClient.get(userId);
  }

  public async getUsersLocationBulk(
    userIds: string[],
  ): Promise<{ location: ICoordinates | null; userId: string }[]> {
    const response = await this.redisClient.getBulk(userIds);

    return response.map((loc, index) => ({
      location: loc
        ? {
            lat: loc.location.lat,
            lng: loc.location.lng,
          }
        : null,
      userId: userIds[index],
    }));
  }
}
