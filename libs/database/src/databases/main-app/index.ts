import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';
import { FriendsSchema, UserSchema } from './models';

@Injectable()
export class MainAppDatabase extends AbstractBaseDatabase {
  public override get models() {
    return {
      users: this.connection.model('User', UserSchema),
      friends: this.connection.model('Friends', FriendsSchema),
    };
  }
}
