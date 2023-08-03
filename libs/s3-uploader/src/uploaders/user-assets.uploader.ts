import { AssetsContstants } from '@app/constants';
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
import { getResizedImages } from './utils/getResizedImages';

@Injectable()
export class UserAssetsUploader {
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

  static avatarSettings = {
    prefix: 'users/avatars',
    ext: 'jpg',
    sizes: [
      AssetsContstants.SQUARE_SIZES.S,
      AssetsContstants.SQUARE_SIZES.XS,
      AssetsContstants.SQUARE_SIZES.M,
    ],
    contentType: 'image/jpeg',
  } satisfies IPictureSettings;

  constructor(private readonly configService: ConfigService) {}

  public async deleteUserProfilePicture(pictureId: string) {
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

  public async deleteUserProfilePictures(profileId: string) {
    const objects = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.awsBucket,
        Prefix: `${UserAssetsUploader.avatarSettings.prefix}/${profileId}`,
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

  public async uploadAvatar(cid: string, photoBuffer: Buffer) {
    const sizes = UserAssetsUploader.avatarSettings.sizes;
    const outputImages = await getResizedImages(photoBuffer, sizes);
    const imageId = `${cid}-${randomUUID()}`;
    const uploadsPromises = outputImages.map(
      async ({ size, sizeName, buffer }) => {
        const assetKey = `${UserAssetsUploader.avatarSettings.prefix}/${imageId}/${sizeName}.${UserAssetsUploader.avatarSettings.ext}`;
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.awsBucket,
            Key: assetKey,
            Body: buffer,
            ContentType: UserAssetsUploader.avatarSettings.contentType,
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
      objectKey: `${UserAssetsUploader.avatarSettings.prefix}/${imageId}`,
      sizes: sizes.map((size) => size.sizeName),
    };
  }

  static getAvatarUrl(assetKey: string, size: AvatarSize): string {
    return `https://meetmap-assets.s3.eu-west-1.amazonaws.com/${assetKey}/${size}.${UserAssetsUploader.avatarSettings.ext}`;
  }

  static getAvatarUrls(assetKey: string) {
    return UserAssetsUploader.avatarSettings.sizes.reduce<
      Record<AvatarSize, string>
    >(
      (acc, curr) => ({
        ...acc,
        [curr.sizeName]: `https://meetmap-assets.s3.eu-west-1.amazonaws.com/${assetKey}/${curr.sizeName}.${UserAssetsUploader.avatarSettings.ext}`,
      }),
      {
        xs: '',
        s: '',
        m: '',
      },
    );
  }
}

export type AvatarSize = Extract<
  AppTypes.AssetsSerivce.Other.SizeName,
  'xs' | 's' | 'm'
>;
