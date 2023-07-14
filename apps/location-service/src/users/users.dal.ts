import { LocationServiceDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { ILocationServiceFriends, ILocationServiceUser } from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    ILocationServiceFriends,
    ILocationServiceUser
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
      ILocationServiceUser,
      'cid' | 'username' | 'profilePicture' | 'name'
    >,
  ) {
    return await this.db.models.users.create({
      // authUserId: payload.authUserId,
      cid: payload.cid,
      profilePicture: payload.profilePicture,
      name: payload.name,
      username: payload.username,
    });
  }

  public async updateUser(
    cid: string,
    payload: Pick<ILocationServiceUser, 'profilePicture' | 'name' | 'username'>,
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
        },
      },
      { new: true, upsert: true },
    );
  }

  public async deleteUser(cid: string) {
    await this.dataManipulation.users.deleteUser(cid);
    return cid;
  }

  public async addFriendCid(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.forceFriendship(
        userCid,
        friendCid,
        session,
      );
    });
  }
  public async removeFriendCid(userCid: string, friendCid: string) {
    await this.db.session(async (session) => {
      return await this.dataManipulation.friends.rejectFriendshipRequest(
        userCid,
        friendCid,
        session,
      );
    });
  }
}
