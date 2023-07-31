import { ImageField, StringField } from '@app/dto/decorators';

export class UploadImageRequestDto {
  @ImageField()
  photo: Express.Multer.File;
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
