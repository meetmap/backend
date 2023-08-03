import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

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
  const minAspectRatio = 6 / 16;
  const maxAspectRatio = 16 / 6;

  if (aspectRatio < minAspectRatio) {
    throw new BadRequestException(
      'Bad image provided, min aspect ratio is 6 / 16',
    );
  } else if (aspectRatio > maxAspectRatio) {
    throw new BadRequestException(
      'Bad image provided, max aspect ratio is 16 / 6',
    );
  }
  return sharp(photoBuffer);
};
