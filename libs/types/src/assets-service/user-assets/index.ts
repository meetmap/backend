import { AssetType, SizeName } from '../other';

export interface IUserAssets {
  id: string;
  userCid: string;
  sizes: SizeName[];
  type: AssetType;
  assetKey: string;
  urls: string[];
  createdAt: Date;
  updatedAt: Date;
}
