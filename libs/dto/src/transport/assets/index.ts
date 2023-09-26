import { BaseDto } from '@app/dto/base';
import { NestedField, NumberField, StringField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class AssetSizeDto
  extends BaseDto
  implements AppTypes.AssetsSerivce.Asset.IAssetSize
{
  @StringField({
    enum: AppTypes.AssetsSerivce.Asset.SizeLabel,
  })
  size_label: AppTypes.AssetsSerivce.Asset.SizeLabel;
  @StringField()
  s3_key: string;
  @NumberField({ optional: true })
  width?: number | undefined;
  @NumberField({ optional: true })
  height?: number | undefined;
}

export class AssetSizeWithUrlDto extends AssetSizeDto {
  @StringField()
  url: string;
}

export class AssetProcessingSizeRequestDto
  extends BaseDto
  implements
    Pick<
      AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AssetsSerivce.Asset.IAsset>,
      'cid'
    >
{
  @StringField({ optional: true })
  batchId?: string;
  @StringField()
  cid: string;
  @NestedField(AssetSizeDto)
  size: AssetSizeDto;
}

export class AssetProcessingBatchRequestDto extends BaseDto {
  @StringField({
    isArray: true,
    maxArrayLength: 10,
  })
  assetUrls: string[];
  @StringField({ optional: true })
  eventCid?: string;
  @StringField({ optional: true })
  userCid?: string;
}

export class AssetProcessingBatchDto extends BaseDto {
  @StringField()
  batchId: string;
  canBeRetried: boolean;
}

export class AssetProcessingSingleAssetRequestDto extends BaseDto {
  @StringField()
  cid: string;
  @StringField({ optional: true })
  batchId?: string;
}

export class AssetDto
  extends BaseDto
  implements
    Pick<AppTypes.AssetsSerivce.Asset.IAsset, 'cid' | 'type' | 'order'>
{
  @StringField()
  cid: string;
  @StringField({ enum: AppTypes.AssetsSerivce.Asset.AssetType })
  type: AppTypes.AssetsSerivce.Asset.AssetType;
  @StringField()
  url: string;
  @NestedField([AssetSizeWithUrlDto])
  sizes: AssetSizeWithUrlDto[];
  @NumberField()
  order: number;
}

export class EventAssetsReadyToAttachDto extends BaseDto {
  @StringField()
  eventCid: string;
  // @NestedField(EventsServiceDto.EventsDto.CreatorResponseDto, {
  //   optional: true,
  // })
  // creator?: EventsServiceDto.EventsDto.CreatorResponseDto;
  @NestedField([AssetDto])
  assets: AssetDto[];
}

// export class AssetUploadRmqRequestDto extends BaseDto {
//   @StringField()
//   uploadId: string;
// }
// export class ProfilePictureUpdatedRmqRequestDto extends AssetUploadRmqRequestDto {
//   @IdField()
//   cid: string;
//   @StringField()
//   assetKey: string;
// }

// export class EventPicturesUpdatedRmqRequestDto extends AssetUploadRmqRequestDto {
//   @IdField()
//   eventCid: string;
//   @StringField({ isArray: true })
//   assetKeys: string[];
// }
