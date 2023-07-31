import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';
import { UserAssetsSchema, UserSchema } from './models';

@Injectable()
export class AssetsServiceDatabase extends AbstractBaseDatabase {
  public async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    for (const modelName in this.models) {
      await this.models[modelName].syncIndexes();
    }
  }
  public override get models() {
    return {
      userAssets: this.connection.model('UserAssets', UserAssetsSchema),
      users: this.connection.model('User', UserSchema),
    };
  }
}
