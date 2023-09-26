import { Module } from '@nestjs/common';
import { AssetUploaderController } from './asset-uploader.controller';

import { AssetServiceUploaderDal } from './asset-uploader.dal';

import { AssetUploaderService } from './asset-uploader.service';

@Module({
  providers: [AssetUploaderService, AssetServiceUploaderDal],
  controllers: [AssetUploaderController],
})
export class AssetUploaderModule {}
