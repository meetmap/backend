import { AppTypes } from '@app/types';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { PassThrough, Readable } from 'stream';
import { IAssetMetadata } from './types';

@Injectable()
export class AssetUploader {
  private readonly awsRegion = this.configService.getOrThrow('AWS_REGION');
  private readonly awsBucketName = this.configService.getOrThrow(
    'AWS_S3_ASSESTS_BUCKET',
  );
  private readonly client = new S3Client({
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
    region: this.awsRegion,
  });

  constructor(private readonly configService: ConfigService) {}

  public get originalImageAssetName() {
    return '_original__image';
  }

  public get originalVideoAssetName() {
    return '_original__video';
  }

  /**
   *
   * @param asset
   * @param destinationAssetKey s3 Object Key
   * @param contentType mime type
   * @param metadata.cid cid of asset
   * @returns
   */
  public async uploadAsset(
    asset: Buffer,
    destinationAssetKey: string,
    contentType: string,
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    metadata: IAssetMetadata = {},
    abortController?: AbortController,
  ) {
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.IMAGE) {
      await this.checkImageMetadata(asset);
    }

    const upload = new Upload({
      client: this.client,
      //@ts-expect-error https://github.com/aws/aws-sdk-js-v3/issues/4942#issuecomment-1629979269
      abortController: abortController,
      params: {
        Bucket: this.awsBucketName,
        Key: destinationAssetKey,
        Body: asset,
        ContentType: contentType,
        Metadata: {
          ...metadata,
        },
      },
    });

    return await upload.done();
  }

  public async checkImageMetadata(
    payload: Readable | Buffer,
  ): Promise<void | never> {
    if (payload instanceof Readable) {
      const transformer = sharp();
      payload.pipe(transformer);
      const metadata = await transformer.metadata();
      this.imageMetadataCheck(metadata);
      return;
    }
    if (payload instanceof Buffer) {
      const metadata = await sharp(payload).metadata();
      this.imageMetadataCheck(metadata);
      return;
    }
    throw new BadRequestException('Unknown payload type in checkImageMetadata');
  }

  public async getAssetStream(assetKey: string): Promise<Readable> {
    const asset = await this.client.send(
      new GetObjectCommand({
        Bucket: this.awsBucketName,
        Key: assetKey,
      }),
    );
    if (!asset.Body) {
      throw new Error('Asset not found');
    }

    return asset.Body as Readable;
  }

  public async createStreamUploader(
    assetKey: string,
    contentType: string | undefined,
    passThrough: PassThrough,
    metadata: IAssetMetadata = {},
  ) {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.awsBucketName,
        Key: assetKey,
        Body: passThrough,
        ContentType: contentType,
        Metadata: { ...metadata },
      },
    });

    return upload;
  }

  public getAssetUrl(s3Key: string) {
    return `https://meetmap-assets.s3.eu-west-1.amazonaws.com/${s3Key}`;
  }

  private imageMetadataCheck(metadata: sharp.Metadata) {
    if (
      typeof metadata.width === 'undefined' ||
      typeof metadata.height === 'undefined'
    ) {
      throw new BadRequestException('Invalid image provided, no metadata');
    }
    const aspectRatio = metadata.width / metadata.height;

    // Change these values to what you consider "too extreme"
    const minAspectRatio = 6 / 20;
    const maxAspectRatio = 20 / 6;

    if (aspectRatio < minAspectRatio) {
      throw new BadRequestException(
        'Bad image provided, min aspect ratio is 6 / 16',
      );
    } else if (aspectRatio > maxAspectRatio) {
      throw new BadRequestException(
        'Bad image provided, max aspect ratio is 16 / 6',
      );
    }
  }
}
