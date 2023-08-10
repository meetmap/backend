import { BaseDto } from '@app/dto/base';
import { IdField, StringField } from '@app/dto/decorators';

export class AssetUploadRmqRequestDto extends BaseDto {
  @StringField()
  uploadId: string;
}
export class ProfilePictureUpdatedRmqRequestDto extends AssetUploadRmqRequestDto {
  @IdField()
  cid: string;
  @StringField()
  assetKey: string;
}

export class EventPicturesUpdatedRmqRequestDto extends AssetUploadRmqRequestDto {
  @IdField()
  eventCid: string;
  @StringField({ isArray: true })
  assetKeys: string[];
}
