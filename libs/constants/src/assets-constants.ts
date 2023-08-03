import { AppTypes } from '@app/types';

export interface IImageSize {
  sizeName: AppTypes.AssetsSerivce.Other.SizeName;
  size: [number, number | undefined];
}

/**
 * @description
 * XS -> map
 *
 * S -> lists
 *
 * M -> single entity responses
 *
 */
export const SQUARE_SIZES = {
  XS: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.XS,
    size: [48, 48],
  },
  S: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.S,
    size: [96, 96],
  },
  M: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.M,
    size: [256, 256],
  },
} satisfies Record<string, IImageSize>;
//spisok 4:3 358 x 262
//single 4:3 390 x 250
/**
 * @description
 * XS -> map
 *
 * S -> lists
 *
 * M -> single entity responses
 *§
 */
export const SIZES_4_3 = {
  XS: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.XS_4_3,
    size: [120, 90],
  },
  S: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.S_4_3,
    size: [480, 360],
  },
  M: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.M_4_3,
    size: [800, 600],
  },
  L: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.L_4_3,
    size: [1600, 1200],
  },
} satisfies Record<string, IImageSize>;

export const OTHER_SIZES = {
  EXACT: {
    sizeName: AppTypes.AssetsSerivce.Other.SizeName.EXACT,
    size: [1600, undefined],
  },
} satisfies Record<string, IImageSize>;
// export enum SQUARE_SIZES {
//   XS = 48,
//   S = 96,
//   M = 256,
// }
