import { LocationServiceDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { RedisService } from '@app/redis';
import { AppTypes } from '@app/types';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class LocationDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    AppTypes.LocationService.Friends.IFriends,
    AppTypes.LocationService.Users.IUser
  >;
  constructor(
    @Inject(RedisService.name)
    private readonly redisClient: RedisService<AppTypes.LocationService.Users.IRedisLocation>,
    private readonly db: LocationServiceDatabase,
  ) {}
  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }

  public async getUserByCid(cid: string) {
    return await this.db.models.users.findOne({ cid });
  }

  public async getAllSelfUserFriends(cid: string) {
    return await this.dataManipulation.friends.getAllUserFriends(cid, cid);
  }

  public async updateUserLocation(
    cid: string,
    coordinates: AppTypes.LocationService.Users.ICoordinates,
  ): Promise<AppTypes.LocationService.Users.ILocation> {
    const updatedAt = new Date();
    this.redisClient.set(
      cid,
      {
        cid: cid,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        updatedAt,
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
      updatedAt,
    };
  }
  public async getUserLocation(
    userCid: string,
  ): Promise<AppTypes.LocationService.Users.ILocation | null> {
    return this.redisClient.get(userCid);
  }

  public async getUsersLocationBulk(
    userIds: string[],
  ): Promise<AppTypes.LocationService.Users.ILocation[]> {
    const response = await this.redisClient.getBulk(userIds);

    return response.map((loc, index) => ({
      location: loc
        ? {
            lat: loc.location.lat,
            lng: loc.location.lng,
          }
        : null,
      cid: userIds[index],
      updatedAt: loc?.updatedAt ?? null,
    }));
  }
}
