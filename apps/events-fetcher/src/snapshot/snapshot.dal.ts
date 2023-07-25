import { EventsFetcherDb } from '@app/database';
import {
  AuthServiceUserSnapshotRequestDto,
  UsersServiceFriendsSnapshotRequestDto,
} from '@app/dto/rabbit-mq-common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SnapshotDal {
  constructor(private readonly db: EventsFetcherDb) {}

  public async updateOrCreateUser(
    payload: AuthServiceUserSnapshotRequestDto[],
  ) {
    await this.db.models.users.bulkWrite(
      payload.map((user) => ({
        updateOne: {
          filter: { cid: user.cid },
          update: {
            $set: {
              birthDate: user.birthDate,
              cid: user.cid,
              username: user.username,
              name: user.name,
            },
          },
          upsert: true,
        },
      })),
    );
  }
  public async updateOrCreateFriendship(
    payload: UsersServiceFriendsSnapshotRequestDto[],
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
            },
          },
          upsert: true,
        },
      })),
    );
  }
}
