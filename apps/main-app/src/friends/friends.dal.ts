import { MainAppDatabase } from '@app/database';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { IMainAppSafePartialUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsDal extends CommonDataManipulation {
  constructor(private readonly db: MainAppDatabase) {
    super(db.models.friends, db.models.users);
  }

  public async getUserByUsername(
    username: string,
  ): Promise<IMainAppSafePartialUser | null> {
    const user = await this.db.models.users.findOne(
      {
        username: username,
      },
      {
        id: true,
        birthDate: true,
        email: true,
        friendsCIds: true,
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
      return UsersService.mapUserDbToResponsePartialUser(user);
    }
    return null;
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
        friendsCIds: true,
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
      return UsersService.mapUserDbToResponsePartialUser(user);
    }
    return null;
  }

  public async sendFriendshipRequest(
    requesterCId: string,
    recipientCId: string,
  ) {
    return await super.friends.sendFriendshipRequest(
      requesterCId,
      recipientCId,
    );
  }
  public async acceptFriendshipRequest(userCId: string, requesterCId: string) {
    return await super.friends.acceptFriendshipRequest(userCId, requesterCId);
  }

  public async rejectFriendshipRequest(userCId: string, requesterCId: string) {
    return await super.friends.rejectFriendshipRequest(userCId, requesterCId);
  }

  public async getUserFriends(userCId: string, limit: number, page: number) {
    return await super.friends.getUserFriends(userCId, limit, page);
  }

  public async getIncomingFriendshipRequests(userCId: string) {
    return await super.friends.getIncomingFriendshipRequests(userCId);
  }

  public async getOutcomingFriendshipRequests(userCId: string) {
    return await super.friends.getOutcomingFriendshipRequests(userCId);
  }
}
