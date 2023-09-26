import { AssetsServiceDatabase } from '@app/database';
import { RabbitmqService } from '@app/rabbitmq';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
import * as path from 'path';

@Injectable()
export class AssetServiceUploaderDal {
  constructor(
    private readonly assetUploader: AssetsUploaders.AssetUploader,
    private readonly rmqService: RabbitmqService,
    private readonly db: AssetsServiceDatabase,
  ) {}

  public async validateFile(
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    fileBuffer: Buffer,
  ) {
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.IMAGE) {
      return await this.assetUploader.checkImageMetadata(fileBuffer);
    }
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.VIDEO) {
      return;
    }
    throw new BadRequestException(`Unknown file type`);
  }

  public async getFileFromUrl(
    url: string,
  ): Promise<{ buffer: Buffer; originalname: string; mimetype: string }> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(response.data, 'binary');
    const originalName = url.split('/').pop();
    let mimetype = response.headers['content-type'];
    if (!mimetype) {
      throw new Error(
        `Mimetype for resource ${url} dosen't specified, can not procceed`,
      );
    }
    if (Array.isArray(mimetype)) {
      mimetype = mimetype[0];
    }
    if (typeof mimetype !== 'string') {
      throw new Error(
        `Invalid mimetype for resource ${url} dosen't specified, can not procceed`,
      );
    }
    return {
      buffer: imageBuffer,
      originalname: originalName ?? '',
      mimetype,
    };
  }

  public getAssetUrl(s3Key: string) {
    return this.assetUploader.getAssetUrl(s3Key);
  }

  public async updateBatchUploadProgressAndNotify(batchId: string) {}

  public async getAndValidateAsset(
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    assetOrUrl: Express.Multer.File | string,
  ) {
    const file =
      typeof assetOrUrl === 'string'
        ? await this.getFileFromUrl(assetOrUrl)
        : assetOrUrl;
    await this.validateFile(type, file.buffer);
    return file;
  }

  /**
   * uploads with callbacks or throws an error
   * @param type
   * @param assetOrUrl
   * @param creator
   * @param isPublic
   * @param beforeUploadCb
   * @param afterUploadCb
   * @returns
   */
  public async uploadAssetWithTransaction(
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    assetOrUrl: Express.Multer.File | string,
    creator: AppTypes.EventsService.Event.ICreator | undefined,
    isPublic: boolean = true,
    beforeUploadCb?: (assetIsValid: boolean) => Promise<void>,
    afterUploadCb?: (
      assetCid: string,
      session: mongoose.ClientSession,
    ) => Promise<void> | void,
  ): Promise<string | never> {
    const asset = await this.getAndValidateAsset(type, assetOrUrl);
    await beforeUploadCb?.(!!asset);
    const uploadAbortController = new AbortController();
    let uploadedAssetCid: string | null = null;
    await this.db.session(
      async (session) => {
        const uploadedAsset = await this.uploadAsset(
          asset,
          type,
          creator,
          isPublic,
          session,
          uploadAbortController,
        );
        if (!uploadedAsset) {
          throw new InternalServerErrorException('Asset not found');
        }
        await afterUploadCb?.(uploadedAsset.cid, session);
        uploadedAssetCid = uploadedAsset.cid;
      },
      [uploadAbortController],
    );
    if (!uploadedAssetCid) {
      throw new InternalServerErrorException('Failed to upload');
    }
    return uploadedAssetCid;
  }

  /**
   *
   * @param assetOrUrl
   * @param type
   * @param creator
   * @param isPublic
   * @default isPublic true
   * @returns
   */
  public async uploadAsset(
    file: Pick<Express.Multer.File, 'buffer' | 'originalname' | 'mimetype'>,
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    creator: AppTypes.EventsService.Event.ICreator | undefined,
    isPublic: boolean = true,
    dbSession: mongoose.ClientSession,
    uploadAbortController: AbortController,
  ) {
    const assetCid = randomUUID();
    const pregeneratedS3Path = `${isPublic ? 'public' : 'private'}/${assetCid}`;

    const originalS3Key = this.getOriginalAssetS3Key(type, pregeneratedS3Path);

    // const file =
    //   typeof assetOrUrl === 'string'
    //     ? await this.getFileFromUrl(assetOrUrl)
    //     : assetOrUrl;

    const fileName = file.originalname;
    const extension = path.extname(fileName);

    //if file is not valid error would be threw
    // await this.validateFile(type, file.buffer);

    const asset: AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AssetsSerivce.Asset.IAsset> =
      {
        cid: assetCid,
        order: 0,
        s3_key: originalS3Key,
        status: AppTypes.AssetsSerivce.Asset.ProcessingStatus.UPLOADING,
        type: type,
        sizes: this.getAssetSizesSchema(type).map((size) => ({
          s3_key: this.getAssetSizeS3Path(
            type,
            pregeneratedS3Path,
            size.size_label,
          ),
          size_label: size.size_label,
          height: size.height,
          width: size.width,
        })),
        upload_progress: 0,
        creator: creator
          ? {
              creatorCid: creator.creatorCid,
              type: creator.type,
            }
          : undefined,
        file_format: extension,
        original_filename: fileName,
      };

    //create record in db with session if session provided
    const dbRecord = new this.db.models.assets(asset);
    await dbRecord.save({
      session: dbSession,
    });
    //upload asset to s3 and update db

    //@todo make it async and notify by rmq
    try {
      await this.assetUploader.uploadAsset(
        file.buffer,
        originalS3Key,
        file.mimetype,
        type,
        {
          cid: assetCid,
        },
        uploadAbortController,
      );
      await this.updateProcessingStatus(
        assetCid,
        AppTypes.AssetsSerivce.Asset.ProcessingStatus.UPLOADED,
        undefined,
        dbSession,
      );
      //@todo notify rmq here
    } catch (error) {
      let failureReason =
        error instanceof Error ? error.message : 'Failed to upload';
      await this.updateProcessingStatus(
        assetCid,
        AppTypes.AssetsSerivce.Asset.ProcessingStatus.FAILED,
        failureReason,
        dbSession,
      );
      //@todo notify rmq here
      throw new InternalServerErrorException(failureReason);
    }

    return await this.getAsset(assetCid, dbSession);
  }

  public getOriginalAssetS3Key(
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    pregeneratedS3Path: string,
  ) {
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.IMAGE) {
      return [
        pregeneratedS3Path,
        this.assetUploader.originalImageAssetName,
      ].join('/');
    }

    if (type === AppTypes.AssetsSerivce.Asset.AssetType.VIDEO) {
      return [
        pregeneratedS3Path,
        this.assetUploader.originalVideoAssetName,
      ].join('/');
    }

    throw new BadRequestException('Unknown asset type');
  }

  public getAssetSizesSchema(type: AppTypes.AssetsSerivce.Asset.AssetType) {
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.IMAGE) {
      return this.imageSizes;
    }
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.VIDEO) {
      return this.videoSizes;
    }
    throw new BadRequestException('Unknown asset type');
  }

  public getAssetSizeS3Path(
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    pregeneratedS3Path: string,
    sizeLabel: AppTypes.AssetsSerivce.Asset.SizeLabel,
  ) {
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.IMAGE) {
      return [pregeneratedS3Path, sizeLabel].join('/');
    }
    if (type === AppTypes.AssetsSerivce.Asset.AssetType.VIDEO) {
      return [
        pregeneratedS3Path,
        AppTypes.AssetsSerivce.Asset.SizeLabel.ABR,
        'index.mpd',
      ].join('/');
    }
    throw new BadRequestException('Unknown asset type');
  }

  public async updateProcessingStatus(
    assetCid: string,
    status: AppTypes.AssetsSerivce.Asset.ProcessingStatus,
    failureReason?: string,
    session?: mongoose.ClientSession,
  ) {
    await this.db.models.assets
      .findOneAndUpdate(
        { cid: assetCid },
        {
          $set: {
            status: status,
            ...(!!failureReason && {
              failureReason,
            }),
          },
        },
        {
          session,
        },
      )
      .lean();
  }

  public async getAsset(cid: string, session?: mongoose.ClientSession) {
    return await this.db.models.assets
      .findOne({ cid }, undefined, { session })
      .lean();
  }

  public get imageSizes(): Omit<
    AppTypes.AssetsSerivce.Asset.IAssetSize,
    's3_key'
  >[] {
    return [
      {
        size_label: AppTypes.AssetsSerivce.Asset.SizeLabel.EXTRA_SMALL,
        height: 48,
        width: 48,
      },
      {
        size_label: AppTypes.AssetsSerivce.Asset.SizeLabel.SMALL,
        height: 96,
        width: 96,
      },
      {
        size_label: AppTypes.AssetsSerivce.Asset.SizeLabel.MEDIUM,
        height: 204,
        width: 204,
      },
      {
        size_label: AppTypes.AssetsSerivce.Asset.SizeLabel.LARGE,
        height: 512,
        width: 512,
      },
    ];
  }

  public get videoSizes(): Omit<
    AppTypes.AssetsSerivce.Asset.IAssetSize,
    's3_key'
  >[] {
    return [
      {
        size_label: AppTypes.AssetsSerivce.Asset.SizeLabel.EXTRA_SMALL,
        width: 640,
        height: 360,
      },
      {
        size_label: AppTypes.AssetsSerivce.Asset.SizeLabel.MEDIUM,
        width: 1280,
        height: 720,
      },
    ];
  }

  public async isValidEvent(eventCid: string) {
    const event = await this.db.models.events.findOne({
      cid: eventCid,
      $expr: {
        $lt: [{ $size: '$assets' }, 10],
      },
    });
    return !!event;
  }

  /**
   * will not push if reached 10 assets, return null
   * @param eventCid
   * @param assetCid
   * @returns
   */
  public async pushAssetToEvent(
    eventCid: string,
    assetCid: string,
    session: mongoose.ClientSession,
  ) {
    return await this.db.models.events
      .findOneAndUpdate(
        {
          cid: eventCid,
          $expr: {
            $lt: [{ $size: '$assets' }, 10],
          },
        },
        {
          $push: {
            assets: assetCid,
          },
        },
      )
      .session(session);
  }

  public async getValidEvent(
    eventCid: string,
    creator: AppTypes.EventsService.Event.ICreator | undefined,
  ) {
    return await this.db.models.events
      .findOne({
        cid: eventCid,
        creator: creator ?? null,
      })
      .lean();
  }
}
