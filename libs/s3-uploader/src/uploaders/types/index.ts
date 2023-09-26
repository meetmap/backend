import { IImageSize } from '@app/constants/assets-constants';

export interface IPictureSettings {
  prefix: `${string}/${string}` | string;
  ext: 'jpg';
  sizes: IImageSize[];
  contentType: 'image/jpeg';
}

export interface IAssetMetadata {
  cid?: string;
}
