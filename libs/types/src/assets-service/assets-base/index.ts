import * as mongoose from 'mongoose';
import { AssetType, SizeName } from '../other';

export interface IAssetsBase {
  uploadId: mongoose.Types.ObjectId;
  id: string;

  sizes: SizeName[];

  type: AssetType;

  assetKey: string;
  urls: string[];
  createdAt: Date;
  updatedAt: Date;
}
