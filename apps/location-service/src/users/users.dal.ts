import { LocationServiceDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { AppTypes } from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    AppTypes.LocationService.Friends.IFriends,
    AppTypes.LocationService.Users.IUser
  >;
  constructor(private readonly db: LocationServiceDatabase) {}

  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }

  public async createUser(
    payload: Pick<
      AppTypes.LocationService.Users.IUser,
      'cid' | 'username' | 'profilePicture' | 'name' | 'gender'
    >,
  ) {
    return await this.db.models.users.create({
      // authUserId: payload.authUserId,
      cid: payload.cid,
      profilePicture: payload.profilePicture,
      name: payload.name,
      username: payload.username,
      gender: payload.gender,
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.LocationService.Users.IUser>);
  }

  public async updateUser(
    cid: string,
    payload: Partial<
      Pick<
        AppTypes.LocationService.Users.IUser,
        'profilePicture' | 'name' | 'username' | 'gender'
      >
    >,
  ) {
    return await this.db.models.users.findOneAndUpdate(
      {
        cid: cid,
      },
      {
        $set: {
          profilePicture: payload.profilePicture,
          name: payload.name,
          username: payload.username,
          cid: cid,
          gender: payload.gender,
        } satisfies Partial<
          AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.LocationService.Users.IUser>
        >,
      },
      { new: true, upsert: true },
    );
  }

  public async deleteUser(cid: string) {
    await this.db.session((session) =>
      this.dataManipulation.users.deleteUser(cid, session),
    );
    return cid;
  }

  public async requestFriend(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.sendFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }

  public async acceptFriend(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.acceptFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }
  public async rejectFriend(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.rejectFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }
}
