import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetServiceUploaderDal } from './asset-uploader.dal';

@Injectable()
export class AssetUploaderService {
  constructor(
    private readonly dal: AssetServiceUploaderDal,
    private readonly rmqService: RabbitmqService,
  ) {}

  public async uploadEventAsset(
    assetOrUrl: Express.Multer.File | string,
    type: AppTypes.AssetsSerivce.Asset.AssetType,
    eventCid: string,
    creator?: AppTypes.EventsService.Event.ICreator,
  ) {
    const event = await this.dal.getValidEvent(eventCid, creator);
    if (!event) {
      throw new BadRequestException('Event or organiser are invalid');
    }

    const assetCid = await this.dal.uploadAssetWithTransaction(
      type,
      assetOrUrl,
      creator,
      true,
      async (assetIsValid) => {
        const isValidEvent = await this.dal.isValidEvent(eventCid);
        if (!isValidEvent && assetIsValid) {
          throw new BadRequestException('Reached limit of 10 assets for event');
        }
      },
      async (assetCid, session) => {
        //notify here probably, idk
        await this.dal.pushAssetToEvent(eventCid, assetCid, session);
      },
    );

    return this.dal.getAsset(assetCid);
  }

  public async getUploadStatus(
    assetCid: string,
    creator?: AppTypes.EventsService.Event.ICreator,
  ) {
    const asset = await this.dal.getAsset(assetCid);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    if (!asset.creator) {
      throw new ForbiddenException('No access to check system uploads');
    }

    if (asset.creator.creatorCid !== creator?.creatorCid) {
      throw new ForbiddenException();
    }
    //@todo add schema (dal.videoAssetSchema, dal.imageAssetSchema) fetch to serverless
    return asset;
  }

  public async onUploadFailed(assetCid: string) {
    //upload failed - do nothng
    await this.dal.updateProcessingStatus(
      assetCid,
      AppTypes.AssetsSerivce.Asset.ProcessingStatus.FAILED,
    );
  }

  public async onPostProcessingSucceed(assetCid: string) {
    await this.dal.updateProcessingStatus(
      assetCid,
      AppTypes.AssetsSerivce.Asset.ProcessingStatus.COMPLETED,
    );
  }

  public async onPostProcessingFailed(
    assetCid: string,
    failureReason?: string,
  ) {
    await this.dal.updateProcessingStatus(
      assetCid,
      AppTypes.AssetsSerivce.Asset.ProcessingStatus.FAILED,
      failureReason ?? 'Post processing failed',
    );
  }
}
