import { Global, Module } from '@nestjs/common';
import { S3UploaderService } from './s3-uploader.service';
import { EventAssetsUploader, UserAssetsUploader } from './uploaders';

@Global()
@Module({
  providers: [S3UploaderService, UserAssetsUploader, EventAssetsUploader],
  exports: [S3UploaderService, UserAssetsUploader, EventAssetsUploader],
})
export class S3UploaderModule {}
