import { UsersServiceDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { AppTypes } from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class FriendsDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    AppTypes.UsersService.Friends.IFriends,
    AppTypes.UsersService.Users.IUser
  >;
  constructor(private readonly db: UsersServiceDatabase) {}
  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }

  public async getUserByCId(currentUserCId: string, searchUserCId: string) {
    const user = await this.dataManipulation.users.getUserWithFriendshipStatus(
      currentUserCId,
      [
        {
          $match: {
            cid: searchUserCId,
          },
        },
      ],
    );
    return user;
  }

  public async sendFriendshipRequest(
    requesterCId: string,
    recipientCId: string,
  ) {
    return await this.db.session(async (session) => {
      await this.dataManipulation.friends.sendFriendshipRequest(
        requesterCId,
        recipientCId,
        session,
      );
    });
  }
  public async acceptFriendshipRequest(userCId: string, requesterCId: string) {
    return await this.db.session(async (session) => {
      return await this.dataManipulation.friends.acceptFriendshipRequest(
        userCId,
        requesterCId,
        session,
      );
    });
  }

  public async rejectFriendshipRequest(userCId: string, requesterCId: string) {
    return await this.db.session(async (session) => {
      return await this.dataManipulation.friends.rejectFriendshipRequest(
        userCId,
        requesterCId,
        session,
      );
    });
  }

  public async getUserFriends(
    currentUserCId: string,
    searchUserCId: string,
    page: number = 1,
  ) {
    return await this.dataManipulation.friends.getUserFriends(
      currentUserCId,
      searchUserCId,
      page,
    );
  }

  public async getIncomingFriendshipRequests(
    userCId: string,
    page: number = 1,
  ) {
    return await this.dataManipulation.friends.getIncomingFriendshipRequests(
      userCId,
      page,
    );
  }

  public async getOutcomingFriendshipRequests(
    userCId: string,
    page: number = 1,
  ) {
    return await this.dataManipulation.friends.getOutcomingFriendshipRequests(
      userCId,
      page,
    );
  }
}
