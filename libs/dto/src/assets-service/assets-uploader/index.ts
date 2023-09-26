import { BaseDto } from '@app/dto/base';
import {
  IdField,
  ImageField,
  NestedField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UploadImageRequestDto extends BaseDto {
  @ImageField()
  photo: Express.Multer.File;
}

export class UploadImageRequestBulkDto extends BaseDto {
  @ImageField({ isArray: true })
  photo: [Express.Multer.File];
}

export class AttachImagesToEventRequestDto extends UploadImageRequestBulkDto {
  @IdField()
  eventId: string;
}

export class AssetResponseDto
  extends BaseDto
  implements Partial<Record<AppTypes.AssetsSerivce.Other.SizeName, string>>
{
  @StringField({ optional: true })
  xs?: string;
  @StringField({ optional: true })
  s?: string;
  @StringField({ optional: true })
  m?: string;
  @StringField({ optional: true })
  l?: string;
  @StringField({ optional: true })
  xl?: string;
  @StringField({ optional: true })
  exact?: string;
}

export class UploadAssetResponseDto extends BaseDto {
  @IdField()
  uploadId: string;
  @StringField({
    enum: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType,
  })
  status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType;
  @NestedField([AssetResponseDto])
  assets: AssetResponseDto[];
}

export class UploadProfilePictureResponseDto extends BaseDto {
  @StringField()
  xs: string;
  @StringField()
  s: string;
  @StringField()
  m: string;
}

export class UploadEventPictureResponseDto extends BaseDto {
  @StringField()
  xs: string;
  @StringField()
  s: string;
  @StringField()
  m: string;
  @StringField()
  l: string;
}
