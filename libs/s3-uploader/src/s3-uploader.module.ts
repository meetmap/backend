import { Global, Module } from '@nestjs/common';
import { S3UploaderService } from './s3-uploader.service';
import { UserAssetsUploader } from './uploaders';

@Global()
@Module({
  providers: [S3UploaderService, UserAssetsUploader],
  exports: [S3UploaderService, UserAssetsUploader],
})
export class S3UploaderModule {}
