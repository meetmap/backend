import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';

import { UserSchema } from './models/user';

@Injectable()
export class AuthServiceDatabase extends AbstractBaseDatabase {
  public override get models() {
    return {
      users: this.connection.model('User', UserSchema),
    };
  }
}
