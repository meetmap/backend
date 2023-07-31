import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AssetsUploaders } from '@app/s3-uploader';
import { Injectable } from '@nestjs/common';
import { AssetsUploaderDal } from './assets-uploader.dal';

@Injectable()
export class AssetsUploaderService {
  constructor(
    private readonly dal: AssetsUploaderDal,
    private readonly rmqService: RabbitmqService,
  ) {}
  public async updateUserProfilePicture(
    cid: string,
    image: Express.Multer.File,
  ) {
    const key = await this.dal.uploadUserProfilePicture(cid, image);
    this.rmqService.amqp.publish(
      RMQConstants.exchanges.ASSETS.name,
      RMQConstants.exchanges.ASSETS.routingKeys.PROFILE_PICTURE_UPDATED,
      AssetsUploaderService.mapToProfilePictureUpdatedTransportRequestDto(
        cid,
        key,
      ),
    );
    return AssetsUploaders.UserAssetsUploader.getAvatarUrls(key);
  }

  static mapToProfilePictureUpdatedTransportRequestDto(
    cid: string,
    assetKey: string,
  ): AppDto.TransportDto.Assets.ProfilePictureUpdatedRmqRequestDto {
    return {
      assetKey: assetKey,
      cid,
    };
  }
}
