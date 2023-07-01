import { LocationServiceDatabase } from '@app/database';
import { RedisService } from '@app/redis';
import { ICoordinates, IUserLocation } from '@app/types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LocationDal {
  constructor(
    @Inject(RedisService.name)
    private readonly redisClient: RedisService<IUserLocation>,
    private readonly db: LocationServiceDatabase,
  ) {}

  public async getUserByCid(cid: string) {
    return await this.db.models.users.findOne({ cid });
  }

  public async updateUserLocation(cid: string, coordinates: ICoordinates) {
    this.redisClient.set(
      cid,
      {
        cid: cid,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      },
      {
        EX: 60 * 60 * 24 * 3, //e.g 3d
      },
    );
    return {
      cid: cid,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
    };
  }
  public async getUserLocation(userCid: string): Promise<IUserLocation | null> {
    return this.redisClient.get(userCid);
  }

  public async getUserFriendsCids(cid: string) {
    const user = await this.db.models.users.findOne({
      cid,
    });
    if (!user) {
      return null;
    }
    return user.friendsCids;
  }

  public async getUsersLocationBulk(
    userIds: string[],
  ): Promise<{ location: ICoordinates | null; cid: string }[]> {
    const response = await this.redisClient.getBulk(userIds);

    return response.map((loc, index) => ({
      location: loc
        ? {
            lat: loc.location.lat,
            lng: loc.location.lng,
          }
        : null,
      cid: userIds[index],
    }));
  }
}
