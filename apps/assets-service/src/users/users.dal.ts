import { AssetsServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersDal implements OnModuleInit {
  constructor(private readonly db: AssetsServiceDatabase) {}
  // private dataManipulation: CommonDataManipulation<
  //   AppTypes.EventsService.Friends.IFriends,
  //   AppTypes.EventsService.Users.IUser
  // >;

  onModuleInit() {
    // this.dataManipulation = new CommonDataManipulation(
    //   this.db.models.friends,
    //   this.db.models.users,
    // );
  }

  public async createUser(payload: AppTypes.Transport.Users.IUser) {
    return await this.db.models.users.create({
      cid: payload.cid,
      name: payload.name,
      username: payload.username,
      gender: payload.gender,
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AssetsSerivce.Users.IUser>);
  }
  public async updateUser(
    cid: string,
    payload: AppTypes.Transport.Users.IUser,
  ) {
    return await this.db.models.users.findOneAndUpdate(
      {
        cid,
      },
      {
        $set: {
          cid: payload.cid,
          username: payload.username,
          gender: payload.gender,
          name: payload.name,
        } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AssetsSerivce.Users.IUser>,
      },
      {
        new: true,
        upsert: true,
      },
    );
  }

  public async deleteUser(cid: string) {
    await this.db.models.users.deleteOne({ cid });
    await this.db.models.userAssets.deleteMany({ userCid: cid });
    // await this.db.session(async (session) => {
    //   await this.dataManipulation.users.deleteUser(cid, session);
    //   await this.db.models.eventsUsers
    //     .deleteMany({ userCId: cid })
    //     .session(session);
    // });

    return cid;
  }

  // public async requestFriend(userCid: string, friendCid: string) {
  //   await this.db.session(async (session) => {
  //     return await this.dataManipulation.friends.sendFriendshipRequest(
  //       userCid,
  //       friendCid,
  //       session,
  //     );
  //   });
  // }

  // public async acceptFriend(userCid: string, friendCid: string) {
  //   await this.db.session(async (session) => {
  //     return await this.dataManipulation.friends.acceptFriendshipRequest(
  //       userCid,
  //       friendCid,
  //       session,
  //     );
  //   });
  // }
  // public async rejectFriend(userCid: string, friendCid: string) {
  //   await this.db.session(async (session) => {
  //     return await this.dataManipulation.friends.rejectFriendshipRequest(
  //       userCid,
  //       friendCid,
  //       session,
  //     );
  //   });
  // }
}
