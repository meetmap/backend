import {
  IdField,
  ImageField,
  NestedField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UploadImageRequestDto {
  @ImageField()
  photo: Express.Multer.File;
}

export class UploadImageRequestBulkDto {
  @ImageField({ isArray: true })
  'photo': [Express.Multer.File];
}

export class AttachImagesToEventRequestDto extends UploadImageRequestBulkDto {
  @IdField()
  eventId: string;
}

export class AssetResponseDto
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

export class UploadAssetResponseDto {
  @IdField()
  uploadId: string;
  @StringField({
    enum: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType,
  })
  status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType;
  @NestedField([AssetResponseDto])
  assets: AssetResponseDto[];
}

export class UploadProfilePictureResponseDto {
  @StringField()
  xs: string;
  @StringField()
  s: string;
  @StringField()
  m: string;
}

export class UploadEventPictureResponseDto {
  @StringField()
  xs: string;
  @StringField()
  s: string;
  @StringField()
  m: string;
  @StringField()
  l: string;
}
