import { Global, Module } from '@nestjs/common';
import { S3UploaderService } from './s3-uploader.service';
import {
  AssetUploader,
  EventAssetsUploader,
  UserAssetsUploader,
} from './uploaders';

@Global()
@Module({
  providers: [
    S3UploaderService,
    UserAssetsUploader,
    EventAssetsUploader,
    AssetUploader,
  ],
  exports: [
    S3UploaderService,
    UserAssetsUploader,
    EventAssetsUploader,
    AssetUploader,
  ],
})
export class S3UploaderModule {}
