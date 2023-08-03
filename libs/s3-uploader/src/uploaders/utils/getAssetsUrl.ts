import { ASSETS_BUCKET_URL } from '@app/constants';
import { AppTypes } from '@app/types';

export const getImageAssetsUrl = (
  asset: AppTypes.AssetsSerivce.AssetsBase.IAssetsBase,
  bucketUrl = ASSETS_BUCKET_URL,
): Partial<Record<AppTypes.AssetsSerivce.Other.SizeName, string>> => {
  return asset.sizes.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: `${bucketUrl}/${asset.assetKey}/${curr}.jpg`,
    }),
    {},
  );
};
