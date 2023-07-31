import { IdField, StringField } from '@app/dto/decorators';

export class ProfilePictureUpdatedRmqRequestDto {
  @IdField()
  cid: string;
  @StringField()
  assetKey: string;
}
