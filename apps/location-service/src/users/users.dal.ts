import { LocationServiceDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { ILocationServiceFriends, ILocationServiceUser } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersDal extends CommonDataManipulation<
  ILocationServiceFriends,
  ILocationServiceUser
> {
  constructor(private readonly db: LocationServiceDatabase) {
    super(db.models.friends, db.models.users);
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
    const user = await this.db.models.users.findOneAndDelete({
      cid: cid,
    });
    if (!user) {
      return;
    }
    //@todo later
    //pull out this user from friends list of every friend
    await this.db.models.users.updateMany(
      {
        friendsCIds: user.cid,
      },
      {
        $pull: {
          friendsCIds: user.cid,
        },
      },
    );
    return cid;
  }

  public async addFriendCid(userCid: string, friendCid: string) {
    await super.friends.forceFriendship(userCid, friendCid);
  }
  public async removeFriendCid(userCid: string, friendCid: string) {
    await super.friends.rejectFriendshipRequest(userCid, friendCid);
  }
}
