import { Module } from '@nestjs/common';
import { AssetsUploaderController } from './assets-uploader.controller';
import { AssetsUploaderDal } from './assets-uploader.dal';
import { AssetsUploaderService } from './assets-uploader.service';

@Module({
  providers: [AssetsUploaderDal, AssetsUploaderService],
  controllers: [AssetsUploaderController],
})
export class AssetsUploaderModule {}
