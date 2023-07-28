import { MainAppDatabase } from '@app/database';
import { AuthServiceUserSnapshotRequestDto } from '@app/dto/rabbit-mq-common';
import {
  IUsersServiceSnapshotFriends,
  IUsersServiceSnapshotUser,
} from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SnapshotDal {
  constructor(private readonly db: MainAppDatabase) {}

  public async updateOrCreateUser(
    payload: AuthServiceUserSnapshotRequestDto[],
  ) {
    await this.db.models.users.bulkWrite(
      payload.map((user) => ({
        updateOne: {
          filter: { cid: user.cid },
          update: {
            $set: {
              email: user.email,
              birthDate: user.birthDate,
              phone: user.phone,
              fbId: user.fbId,
              username: user.username,
              name: user.name,
            },
          },
          upsert: true,
        },
      })),
    );
  }

  public getAllFriendsCursor(batchSize: number) {
    return this.db.models.friends
      .find({}, {
        recipientCId: true,
        requesterCId: true,
        status: true,
      } satisfies Record<keyof IUsersServiceSnapshotFriends, true>)
      .cursor({ batchSize });
  }

  public getAllUsersCursor(batchSize: number) {
    return this.db.models.users
      .find({}, {
        cid: true,
        description: true,
        name: true,
        profilePicture: true,
      } satisfies Record<keyof IUsersServiceSnapshotUser, true>)
      .cursor({ batchSize });
  }
}
