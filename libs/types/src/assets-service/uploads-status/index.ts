export interface IUploadsStatus {
  id: string;
  status: UploadStatusType;
  type: UploadType;
  userCid: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UploadType {
  EVENTS_ASSETS = 'events-assets',
  USERS_ASSETS = 'users-assets',
}

export enum UploadStatusType {
  PENDING = 'pending',
  FAILED = 'failed',
  SUCCEED = 'succeed',
}
