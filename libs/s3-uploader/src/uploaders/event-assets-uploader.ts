import { AssetsContstants, ASSETS_BUCKET_URL } from '@app/constants';
import { AppTypes } from '@app/types';
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IPictureSettings } from './types';
import { getResizedImages } from './utils/sharp-guard';

@Injectable()
export class EventAssetsUploader {
  private readonly awsRegion = this.configService.getOrThrow('AWS_REGION');
  private readonly awsBucket = this.configService.getOrThrow(
    'AWS_S3_ASSESTS_BUCKET',
  );
  private readonly client = new S3Client({
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
    region: this.awsRegion,
  });

  static eventPictureSettings: IPictureSettings = {
    prefix: 'events',
    ext: 'jpg',
    sizes: [
      AssetsContstants.SQUARE_SIZES.S,
      AssetsContstants.SIZES_4_3.S,
      AssetsContstants.SQUARE_SIZES.S,
      AssetsContstants.OTHER_SIZES.EXACT,
    ],
    contentType: 'image/jpeg',
  } satisfies IPictureSettings;

  constructor(private readonly configService: ConfigService) {}

  public async deleteEventPicture(pictureId: string) {
    const objects = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.awsBucket,
        Prefix: `${pictureId}/`,
      }),
    );
    if (!objects.Contents) {
      return;
    }
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.awsBucket,
        Delete: {
          Objects: objects.Contents.filter((k): k is ObjectIdentifier => !!k),
        },
      }),
    );
  }

  public async deleteEventPictures(eventId: string) {
    const objects = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.awsBucket,
        Prefix: `${EventAssetsUploader.eventPictureSettings.prefix}/${eventId}`,
      }),
    );
    if (!objects.Contents) {
      return;
    }
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.awsBucket,
        Delete: {
          Objects: objects.Contents.filter((k): k is ObjectIdentifier => !!k),
        },
      }),
    );
  }

  public async uploadEventPicture(eventId: string, photoBuffer: Buffer) {
    const sizes = EventAssetsUploader.eventPictureSettings.sizes;
    const outputImages = await getResizedImages(photoBuffer, sizes);
    const imageId = `${eventId}-${randomUUID()}`;
    const uploadsPromises = outputImages.map(
      async ({ size, sizeName, buffer }) => {
        const assetKey = `${EventAssetsUploader.eventPictureSettings.prefix}/${imageId}/${sizeName}.${EventAssetsUploader.eventPictureSettings.ext}`;
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.awsBucket,
            Key: assetKey,
            Body: buffer,
            ContentType: EventAssetsUploader.eventPictureSettings.contentType,
          }),
        );
        return {
          sizeName,
          key: assetKey,
        };
      },
    );
    await Promise.all(uploadsPromises);
    return {
      objectKey: `${EventAssetsUploader.eventPictureSettings.prefix}/${imageId}`,
      sizes: sizes.map((size) => size.sizeName),
    };
  }

  static getEventPictureUrl(assetKey: string, size: EventPictureSize): string {
    return `https://meetmap-assets.s3.eu-west-1.amazonaws.com/${assetKey}/${size}.${EventAssetsUploader.eventPictureSettings.ext}`;
  }

  static getEventPictureUrls(cid: string) {
    return EventAssetsUploader.eventPictureSettings.sizes.reduce<
      Record<EventPictureSize, string>
    >(
      (acc, curr) => ({
        ...acc,
        [curr.sizeName]: `${ASSETS_BUCKET_URL}/${EventAssetsUploader.eventPictureSettings.prefix}/${cid}/${curr.sizeName}.${EventAssetsUploader.eventPictureSettings.ext}`,
      }),
      {
        xs: '',
        s: '',
        m: '',
        exact: '',
      },
    );
  }
}

export type EventPictureSize = Extract<
  AppTypes.AssetsSerivce.Other.SizeName,
  'xs' | 's' | 'm' | 'exact'
>;
