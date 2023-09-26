import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import {
  UploadedImage,
  UploadedImages,
  UseFileInterceptor,
} from '@app/dto/decorators';
import { RabbitmqService } from '@app/rabbitmq';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { AssetUploaderService } from './asset-uploader.service';

@Controller('/upload-test')
export class AssetUploaderController {
  constructor(
    private readonly assetsUploaderService: AssetUploaderService,
    private readonly rmqService: RabbitmqService,
  ) {}

  // @ApiOkResponse({
  //   type: AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto,
  // })
  // @UseMicroserviceAuthGuard()
  // @Post('/avatar')
  // @ApiConsumes('multipart/form-data')
  // @UseFileInterceptor('photo')
  // public async updateUserProfilePicture(
  //   @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  //   @UploadedImage()
  //   file: Express.Multer.File,
  //   @Body()
  //   payload: AppDto.AssetsServiceDto.AssetsUploaders.UploadImageRequestDto,
  // ): Promise<AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto> {}

  @ApiOkResponse({
    // type: AppDto.AssetsServiceDto.AssetsUploaders.UploadAssetResponseDto,
  })
  // @UseMicroserviceAuthGuard()
  @Post('/test')
  @ApiConsumes('multipart/form-data')
  @UseFileInterceptor('photo')
  public async test(
    // @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @UploadedImage()
    file: Express.Multer.File,
    @Body()
    payload: AppDto.AssetsServiceDto.AssetsUploaders.UploadImageRequestDto,
  ) {
    return await this.assetsUploaderService.uploadAssetsBatch([file]);
  }

  @Post('/test-bulk')
  @ApiConsumes('multipart/form-data')
  @UseFileInterceptor('photo', 10)
  public async testBulk(
    // @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @UploadedImages()
    files: Express.Multer.File[],
    @Body()
    payload: AppDto.AssetsServiceDto.AssetsUploaders.UploadImageRequestBulkDto,
  ) {
    return await this.assetsUploaderService.uploadAssetsBatch(files);
  }

  //event-assets
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENT_PROCESSING.name,
    routingKey: [
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_INITIALIZED,
    ],
    queue: 'assets-service.processing.event-with-assets.created',
  })
  public async handleEventCreatedAssets(
    @RabbitPayload()
    payload: AppDto.TransportDto.Events.CreateEventPayload,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    if (!payload.assetsUrls?.length) {
      return;
    }
    await this.assetsUploaderService.uploadAssetsBatchForTicketingPlatformEvent(
      payload.assetsUrls,
      payload.cid,
      payload.creator,
    );
  }

  ///BATCH
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey: RMQConstants.exchanges.ASSETS.routingKeys.UPLOAD_STARTED,
    queue: 'assets-service.processing.batch-requested',
    queueOptions: {},
  })
  public async handleBatchProcessingRequested(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.AssetProcessingBatchRequestDto,
  ) {
    try {
    } catch (error) {
      await this.rmqService.amqp.publish(
        '',
        '',
        {},
        {
          headers: {},
        },
      );
    }
    // return await this.assetsUploaderService.handleAssetSizeProcessingRequest(
    //   payload,
    // );
  }
  //@todo add dlx
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey: RMQConstants.exchanges.ASSETS.routingKeys.UPLOAD_FAILED,
    queue: 'service.assets.uploader.upload.failed',
  })
  public async onUpdloadFailed(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.AssetProcessingBatchDto,
  ) {
    //@todo mark in db as failed and delete from s3
    return;
  }

  //@todo add dlx
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey:
      RMQConstants.exchanges.ASSETS.routingKeys.POST_PROCESSING_FAILED,
    queue: 'service.assets.uploader.post-processing.failed',
  })
  public async onPostProcessingFailed(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.AssetProcessingBatchDto,
  ) {
    //@todo mark in db as failed and delete from s3
    return;
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey:
      RMQConstants.exchanges.ASSETS.routingKeys.POST_PROCESSING_SUCCEED,
    queue: 'service.assets.uploader.post-processing.succeed',
  })
  public async postProcessingSucceed(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.AssetProcessingBatchDto,
  ) {
    //@todo mark in db as succeed
    return;
  }
}
