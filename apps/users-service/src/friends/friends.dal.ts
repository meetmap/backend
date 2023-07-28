import { UsersServiceDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { IMainAppFriends, IMainAppUser } from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class FriendsDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    IMainAppFriends,
    IMainAppUser
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
    limit: number,
    page: number,
  ) {
    return await this.dataManipulation.friends.getUserFriends(
      currentUserCId,
      searchUserCId,
      limit,
      page,
    );
  }

  public async getIncomingFriendshipRequests(userCId: string) {
    return await this.dataManipulation.friends.getIncomingFriendshipRequests(
      userCId,
    );
  }

  public async getOutcomingFriendshipRequests(userCId: string) {
    return await this.dataManipulation.friends.getOutcomingFriendshipRequests(
      userCId,
    );
  }
}
