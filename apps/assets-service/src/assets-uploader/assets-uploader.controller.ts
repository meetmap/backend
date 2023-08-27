import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import {
  UploadedImage,
  UploadedImages,
  UseFileInterceptor,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { AssetsUploaderService } from './assets-uploader.service';

@Controller('/upload')
export class AssetsUploaderController {
  constructor(private readonly assetsUploaderService: AssetsUploaderService) {}

  @ApiOkResponse({
    type: AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto,
  })
  @UseMicroserviceAuthGuard()
  @Get('/status/:uploadId')
  public async checkUploadStatus(
    @Param('uploadId') uploadId: string,
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto> {
    const upload = await this.assetsUploaderService.checkUploadStatus(
      jwt.cid,
      uploadId,
    );
    return {
      uploadId: upload.id,
      status: upload.status,
      assets: upload.assets,
    };
  }

  @ApiOkResponse({
    type: AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto,
  })
  @UseMicroserviceAuthGuard()
  @Post('/avatar')
  @ApiConsumes('multipart/form-data')
  @UseFileInterceptor('photo')
  public async updateUserProfilePicture(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @UploadedImage()
    file: Express.Multer.File,
    @Body()
    payload: AppDto.AssetsServiceDto.AssetsUploaders.UploadImageRequestDto,
  ): Promise<AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto> {
    const uploadId = await this.assetsUploaderService.updateUserProfilePicture(
      jwt.cid,
      file,
    );
    return {
      uploadId,
      status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.PENDING,
      assets: [],
    };
  }

  @ApiOkResponse({
    type: AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto,
  })
  @UseMicroserviceAuthGuard()
  @Post('/event-photos')
  @ApiConsumes('multipart/form-data')
  @UseFileInterceptor('photo', 10)
  public async attachEventPhotos(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @UploadedImages()
    photos: Express.Multer.File[],
    @Body()
    payload: AppDto.AssetsServiceDto.AssetsUploaders.AttachImagesToEventRequestDto,
  ): Promise<AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto> {
    const uploadId = await this.assetsUploaderService.attachEventPhotos(
      jwt.cid,
      payload.eventId,
      photos,
    );
    return {
      uploadId,
      status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.PENDING,
      assets: [],
    }; // return files;
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey: [
      RMQConstants.exchanges.ASSETS.routingKeys.ASSET_UPLOAD_FAILED,
      RMQConstants.exchanges.ASSETS.routingKeys.PROFILE_PICTURE_UPDATED,
      RMQConstants.exchanges.ASSETS.routingKeys.EVENT_PICTURE_UPDATED,
    ],
    queue: 'assets-service.assets.upload-status',
  })
  public async assetUploadStatusHandler(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.AssetUploadRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    console.log('Assets uploaded');
    await this.assetsUploaderService.assetUploadStatusHandler(
      payload.uploadId,
      req.fields.routingKey ===
        RMQConstants.exchanges.ASSETS.routingKeys.ASSET_UPLOAD_FAILED
        ? AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.FAILED
        : AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.SUCCEED,
    );
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
    ],
    queue: 'assets-service.assets.process-event-assets-urls',
  })
  public async processEventUrlAssets(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.CreateEventPayload,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    try {
      console.log('Processing event assets');
      if (!payload.assetsUrls) {
        console.log('No assets urls found');
        return;
      }
      await this.assetsUploaderService.setEventUrlAssets(
        payload.cid,
        payload.assetsUrls,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
