import { IImageSize } from '@app/constants/assets-constants';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

export const getResizedImages = async (
  photoBuffer: Buffer,
  sizes: IImageSize[],
) => {
  const sharp = await getSharp(photoBuffer);
  const outputImages = await Promise.all(
    sizes.map(async ({ size, sizeName }) => {
      const buffer = await sharp
        // .rotate()
        .resize(...size)
        .jpeg()
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

export const getSharp = async (photoBuffer: Buffer) => {
  const metadata = await sharp(photoBuffer).metadata();
  if (
    typeof metadata.width === 'undefined' ||
    typeof metadata.height === 'undefined'
  ) {
    throw new BadRequestException('Invalid image provided, no metadata');
  }
  const aspectRatio = metadata.width / metadata.height;

  // Change these values to what you consider "too extreme"
  const minAspectRatio = 9 / 16;
  const maxAspectRatio = 16 / 9;

  if (aspectRatio < minAspectRatio) {
    throw new BadRequestException(
      'Bad image provided, min aspect ratio is 9 / 16',
    );
  } else if (aspectRatio > maxAspectRatio) {
    throw new BadRequestException(
      'Bad image provided, max aspect ratio is 9 / 16',
    );
  }
  return sharp(photoBuffer);
};
