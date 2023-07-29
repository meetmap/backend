import { LocationServiceDatabase } from '@app/database';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SnapshotDal {
  constructor(private readonly db: LocationServiceDatabase) {}

  public async updateOrCreateUser(
    payload: AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto[],
  ) {
    await this.db.models.users.bulkWrite(
      payload.map((user) => ({
        updateOne: {
          filter: { cid: user.cid },
          update: {
            $set: {
              username: user.username,
              name: user.name,
              gender: user.gender,
            } satisfies Partial<AppTypes.LocationService.Users.IUser>,
          },
          upsert: true,
        },
      })),
    );
  }

  public async updateUserAgainstUserService(
    payload: AppDto.TransportDto.Users.UsersServiceUserSnapshotRequestDto[],
  ) {
    await this.db.models.users.bulkWrite(
      payload.map((user) => ({
        updateOne: {
          filter: { cid: user.cid },
          update: {
            $set: {
              profilePicture: user.profilePicture,
            } satisfies Partial<AppTypes.LocationService.Users.IUser>,
          },
        },
      })),
    );
  }

  public async updateOrCreateFriendship(
    payload: AppDto.TransportDto.Friends.UsersServiceFriendsSnapshotRequestDto[],
  ) {
    await this.db.models.friends.bulkWrite(
      payload.map((friend) => ({
        updateOne: {
          filter: {
            recipientCId: friend.recipientCId,
            requesterCId: friend.requesterCId,
          },
          update: {
            $set: {
              status: friend.status,
            } satisfies Partial<AppTypes.LocationService.Friends.IFriends>,
          },
          upsert: true,
        },
      })),
    );
  }
}
