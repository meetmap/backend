import { Injectable } from '@nestjs/common';
import { AbstractBaseDatabase } from '../abstract.db';
import { BatchUploadSchema, UserAssetsSchema, UserSchema } from './models';
import { AssetSchema } from './models/asset';
import { EventsSchema } from './models/event';
import { EventsAssetsSchema } from './models/eventsAssets';
import { UploadsStatusSchema } from './models/uploadsStatus';

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
      events: this.connection.model('Events', EventsSchema),
      eventsAssets: this.connection.model('EventsAssets', EventsAssetsSchema),
      uploadsStatus: this.connection.model(
        'UploadsStatus',
        UploadsStatusSchema,
      ),
      assets: this.connection.model('Assets', AssetSchema),
      batchUploads: this.connection.model('BatchUploads', BatchUploadSchema),
    };
  }
}
