import { Global, Module } from '@nestjs/common';
import { S3UploaderService } from './s3-uploader.service';

@Global()
@Module({
  providers: [S3UploaderService],
  exports: [S3UploaderService],
})
export class S3UploaderModule {}
