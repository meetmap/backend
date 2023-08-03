import { IImageSize } from '@app/constants/assets-constants';
import { getSharp } from './sharp-guard';

export const getResizedImages = async (
  photoBuffer: Buffer,
  sizes: IImageSize[],
) => {
  const sharp = await getSharp(photoBuffer);
  const outputImages = await Promise.all(
    sizes.map(async ({ size, sizeName }) => {
      const buffer = await sharp
        .rotate()
        .resize(...size)
        .jpeg()
        .withMetadata()
        .toBuffer();
      return {
        size,
        sizeName,
        buffer,
      };
    }),
  );
  return outputImages;
};
