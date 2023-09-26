import { AppTypes } from '@app/types';

// export interface IBatchUpload {
//   id: string;
//   creator?: AppTypes.EventsService.Event.ICreator;
//   assets: IBatchUploadAssetMeta[];
//   overall_progress: number; //from 0 to 100
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IBatchUploadPopulated {
//   id: string;
//   creator?: AppTypes.EventsService.Event.ICreator;
//   assets: IAsset[];
//   overall_progress: number; //from 0 to 100
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IBatchUploadAssetMeta {
//   cid: string;
//   status: ProcessingStatus;
// }

export interface IAsset {
  id: string;
  cid: string;
  creator?: AppTypes.EventsService.Event.ICreator;
  type: AssetType;
  original_filename?: string;
  /**
   * extension
   */
  file_format?: string;
  /**
   * for original one
   */
  s3_key: string;
  sizes: IAssetSize[];
  status: ProcessingStatus;
  order: number;
  failureReason?: string;
  /**
   * 0-100, for images step = 50, for videos step = 10
   */
  upload_progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetSize {
  size_label: SizeLabel;
  s3_key: string;
  width?: number;
  height?: number;
}

export enum ProcessingStatus {
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  POST_PROCESSING = 'post_processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SizeLabel {
  EXTRA_SMALL = 'xs',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  /**
   * video only
   */
  ABR = 'abr',
}

export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
}
