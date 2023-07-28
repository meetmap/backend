import { AuthServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SnapshotDal {
  constructor(private readonly db: AuthServiceDatabase) {}

  public getAllUsersCursor(batchSize: number) {
    return this.db.models.users
      .find({}, {
        birthDate: true,
        cid: true,
        email: true,
        fbId: true,
        name: true,
        phone: true,
        username: true,
      } satisfies Record<keyof AppTypes.Transport.Snapshot.Users.IAuthServiceSnapshot, true>)
      .cursor({
        batchSize,
      });
  }
}
