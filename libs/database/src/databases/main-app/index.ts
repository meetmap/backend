import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';
import { FriendsSchema, UserSchema } from './models';

@Injectable()
export class MainAppDatabase extends AbstractBaseDatabase {
  public async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    for (const modelName in this.models) {
      await this.models[modelName].syncIndexes();
    }
  }
  public override get models() {
    return {
      users: this.connection.model('User', UserSchema),
      friends: this.connection.model('Friends', FriendsSchema),
    };
  }
}
