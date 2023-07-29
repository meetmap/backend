import { UsersServiceDatabase } from '@app/database';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SnapshotDal {
  constructor(private readonly db: UsersServiceDatabase) {}

  public async updateOrCreateUser(
    payload: AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto[],
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
              gender: user.gender,
            } satisfies Partial<AppTypes.UsersService.Users.IUser>,
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
      } satisfies Record<keyof AppTypes.Transport.Snapshot.Friends.IUsersServiceSnapshot, true>)
      .cursor({ batchSize });
  }

  public getAllUsersCursor(batchSize: number) {
    return this.db.models.users
      .find({}, {
        cid: true,
        description: true,
        profilePicture: true,
      } satisfies Record<keyof AppTypes.Transport.Snapshot.Users.IUsersServiceSnapshot, true>)
      .cursor({ batchSize });
  }
}
