import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { getImageAssetsUrl } from '@app/s3-uploader/uploaders/utils/getAssetsUrl';
import { AppTypes } from '@app/types';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetsUploaderDal } from './assets-uploader.dal';

@Injectable()
export class AssetsUploaderService {
  constructor(
    private readonly dal: AssetsUploaderDal,
    private readonly rmqService: RabbitmqService,
  ) {}

  public async checkUploadStatus(userCid: string, uploadId: string) {
    const upload = await this.dal.getUploadById(uploadId);
    if (!upload) {
      throw new NotFoundException('Upload not found');
    }
    if (userCid !== upload.userCid) {
      throw new ForbiddenException('Access denied');
    }
    if (
      upload.status ===
      AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.SUCCEED
    ) {
      const assets = await this.dal.getAssetsByUploadId(upload.id);
      return {
        ...upload,
        assets: assets.map((asset) => getImageAssetsUrl(asset)),
      };
    }
    return { ...upload, assets: [] };
  }
  public async updateUserProfilePicture(
    cid: string,
    image: Express.Multer.File,
  ) {
    const uploadId = await this.dal.startUserUploadProfilePicture(cid);
    this.dal
      .userProfilePictureUploadHandler(cid, uploadId, image)
      .then((key) => {
        this.rmqService.amqp.publish(
          RMQConstants.exchanges.ASSETS.name,
          RMQConstants.exchanges.ASSETS.routingKeys.PROFILE_PICTURE_UPDATED,
          AppDto.TransportDto.Assets.ProfilePictureUpdatedRmqRequestDto.create({
            cid,
            assetKey: key,
            uploadId,
          }),
        );
      })
      .catch(() => {
        this.rmqService.amqp.publish(
          RMQConstants.exchanges.ASSETS.name,
          RMQConstants.exchanges.ASSETS.routingKeys.ASSET_UPLOAD_FAILED,
          AppDto.TransportDto.Assets.AssetUploadRmqRequestDto.create({
            uploadId,
          }),
        );
      });

    return uploadId;
    // const key = await this.dal.uploadUserProfilePicture(cid, image);
    // return AssetsUploaders.UserAssetsUploader.getAvatarUrls(key);
  }

  public async attachEventPhotos(
    userCid: string,
    eventCid: string,
    photos: Express.Multer.File[],
  ) {
    const event = await this.dal.getEventByCid(eventCid);
    if (!event) {
      throw new NotFoundException("Event doesn't exist");
    }
    if (event.creator?.creatorCid !== userCid) {
      throw new ForbiddenException('Access denied');
    }
    const uploadId = await this.dal.startEventPictureUpload(
      eventCid,
      userCid,
      photos.length,
    );
    this.dal
      .eventPicturesUploadHandler(eventCid, uploadId, photos)
      .then((keys) => {
        this.rmqService.amqp.publish(
          RMQConstants.exchanges.ASSETS.name,
          RMQConstants.exchanges.ASSETS.routingKeys.EVENT_PICTURE_UPDATED,
          AppDto.TransportDto.Assets.EventPicturesUpdatedRmqRequestDto.create({
            eventCid,
            assetKeys: keys,
            uploadId: uploadId,
          }),
        );
      })
      .catch(() => {
        this.rmqService.amqp.publish(
          RMQConstants.exchanges.ASSETS.name,
          RMQConstants.exchanges.ASSETS.routingKeys.ASSET_UPLOAD_FAILED,
          AppDto.TransportDto.Assets.AssetUploadRmqRequestDto.create({
            uploadId,
          }),
        );
      });
    return uploadId;
  }

  public async assetUploadStatusHandler(
    payloadId: string,

    status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType,
  ) {
    await this.dal.updateUploadStatus(payloadId, status);
  }
}
