import { MainAppDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import {
  FriendshipStatus,
  IMainAppFriends,
  IMainAppSafePartialUser,
  IMainAppUser,
} from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    IMainAppFriends,
    IMainAppUser
  >;
  constructor(private readonly db: MainAppDatabase) {}
  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }

  public async getUserByCId(
    cid: string,
  ): Promise<IMainAppSafePartialUser | null> {
    const user = await this.db.models.users.findOne(
      {
        cid,
      },
      {
        id: true,
        birthDate: true,
        email: true,
        username: true,
        phone: true,
        cid: true,
        description: true,
        fbId: true,
        name: true,
        profilePicture: true,
      },
    );
    if (user) {
      //check it
      return UsersService.mapUserDbToResponsePartialUser({
        ...user.toObject(),
        friendshipStatus: FriendshipStatus.PENDING,
      });
    }
    return null;
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

  public async getUserFriends(userCId: string, limit: number, page: number) {
    return await this.dataManipulation.friends.getUserFriends(
      userCId,
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
