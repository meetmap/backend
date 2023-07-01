import { LocationServiceDatabase } from '@app/database';
import { ILocationServiceUser } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersDal {
  constructor(private readonly db: LocationServiceDatabase) {}

  public async createUser(
    payload: Pick<ILocationServiceUser, /* 'authUserId' |  */ 'cid'>,
  ) {
    return await this.db.models.users.create({
      // authUserId: payload.authUserId,
      cid: payload.cid,
    });
  }

  public async deleteUser(cid: string) {
    const user = await this.db.models.users.findOneAndDelete({
      cid: cid,
    });
    if (!user) {
      return;
    }
    //pull out this user from friends list of every friend
    await this.db.models.users.updateMany(
      {
        friendsCids: user.cid,
      },
      {
        $pull: {
          friendsCids: user.cid,
        },
      },
    );
    return cid;
  }

  public async addFriendCid(userCid: string, friendCid: string) {
    //@todo probably need to check user existance
    await this.db.models.users.findOneAndUpdate(
      {
        cid: userCid,
      },
      {
        $push: {
          friendsCids: friendCid,
        },
      },
    );
    await this.db.models.users.findOneAndUpdate(
      {
        cid: friendCid,
      },
      {
        $push: {
          friendsCids: userCid,
        },
      },
    );
  }
  public async removeFriendCid(userCid: string, friendCid: string) {
    //@todo probably need to check user existance
    await this.db.models.users.findOneAndUpdate(
      {
        cid: userCid,
      },
      {
        $pull: {
          friendsCids: friendCid,
        },
      },
    );
    await this.db.models.users.findOneAndUpdate(
      {
        cid: friendCid,
      },
      {
        $pull: {
          friendsCids: userCid,
        },
      },
    );
  }
}
