import { AssetsServiceDatabase } from '@app/database';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as mongoose from 'mongoose';

@Injectable()
export class AssetsUploaderDal {
  constructor(
    private readonly userAssetsUploader: AssetsUploaders.UserAssetsUploader,
    private readonly eventAssetsUploader: AssetsUploaders.EventAssetsUploader,
    private readonly db: AssetsServiceDatabase,
  ) {}

  public async getUploadById(uploadId: string) {
    const upload = await this.db.models.uploadsStatus.findById(uploadId);
    return upload?.toObject() ?? null;
  }

  public async getAssetsByUploadId(
    uploadId: string,
  ): Promise<AppTypes.AssetsSerivce.AssetsBase.IAssetsBase[]> {
    const upload = await this.db.models.uploadsStatus.findById(uploadId);
    if (!upload) {
      return [];
    }
    const uploadObject = upload.toObject();
    if (
      upload.type ===
      AppTypes.AssetsSerivce.UploadsStatus.UploadType.USERS_ASSETS
    ) {
      const assets = await this.db.models.userAssets.find({
        uploadId: new mongoose.Types.ObjectId(uploadObject.id),
      });
      return assets;
    }
    if (
      upload.type ===
      AppTypes.AssetsSerivce.UploadsStatus.UploadType.EVENTS_ASSETS
    ) {
      const assets = await this.db.models.eventsAssets.find({
        uploadId: new mongoose.Types.ObjectId(uploadObject.id),
      });
      return assets;
    }
    return [];
  }

  public async getEventByCid(eventCid: string) {
    const event = await this.db.models.events.findOne({
      cid: eventCid,
    });
    return event?.toObject() ?? null;
  }

  public async updateUploadStatus(
    uploadId: string,
    status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType,
  ) {
    await this.db.models.uploadsStatus.findByIdAndUpdate(uploadId, {
      $set: {
        status,
      },
    });
  }

  public async startEventPictureUpload(
    eventCid: string,
    userCid: string,
    amountOfAssets: number,
  ) {
    const event = await this.db.models.events.findOne({ cid: eventCid });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.assets.length + amountOfAssets > 10) {
      throw new ConflictException('Reached limit of 10 assets per event');
    }
    //throw error if user already uploading event pictures
    const existingUpload = await this.db.models.uploadsStatus.findOne({
      userCid: userCid,
      status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.PENDING,
      type: AppTypes.AssetsSerivce.UploadsStatus.UploadType.EVENTS_ASSETS,
    });

    if (existingUpload) {
      throw new ConflictException('Already uploading assets');
    }

    const uploadStatus = await this.db.models.uploadsStatus.create({
      status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.PENDING,
      userCid: userCid,
      type: AppTypes.AssetsSerivce.UploadsStatus.UploadType.EVENTS_ASSETS,
    });

    return uploadStatus.toObject().id;
  }

  public async eventPicturesUploadHandler(
    eventCid: string,
    uploadId: string,
    images: Express.Multer.File[],
  ): Promise<string[]> {
    const event = await this.db.models.events.findOne({ cid: eventCid });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const assetsPromises = images.map(async (image) => {
      const { objectKey, sizes } =
        await this.eventAssetsUploader.uploadEventPicture(
          eventCid,
          image.buffer,
        );
      {
        const event = await this.db.models.events.findOne({ cid: eventCid });
        if (event && event.assets.length >= 9) {
          throw new ConflictException('Reached limit of 10 assets per event');
        }
      }
      await this.db.session(async (session) => {
        const [asset] = await this.db.models.eventsAssets.create(
          [
            {
              assetKey: objectKey,
              sizes: sizes,
              type: AppTypes.AssetsSerivce.Other.AssetType.IMAGE,
              urls: sizes.map((size) =>
                AssetsUploaders.EventAssetsUploader.getEventPictureUrl(
                  objectKey,
                  size as AssetsUploaders.EventPictureSize,
                ),
              ),
              eventCid: eventCid,
              uploadId: new mongoose.Types.ObjectId(uploadId),
            },
          ],
          { session },
        );
        await this.db.models.events.findOneAndUpdate(
          { cid: eventCid },
          {
            $push: {
              assets: asset.id,
            },
          },
          {
            session,
          },
        );
      });

      return objectKey;
    });

    const asstes = await Promise.allSettled(assetsPromises);
    return asstes
      .filter((asset): asset is PromiseFulfilledResult<string> => {
        if (asset.status === 'rejected') {
          console.error(asset.reason);
        }
        return asset.status === 'fulfilled';
      })
      .map((asset) => asset.value);
  }

  public async startUserUploadProfilePicture(cid: string) {
    const user = await this.db.models.users.findOne({ cid: cid }).populate<{
      profilePicture?: AppTypes.AssetsSerivce.UserAssets.IUserAssets;
    }>('profilePicture' satisfies keyof AppTypes.AssetsSerivce.Users.IUser);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //throw error if user already uploading profile picture
    const existingUpload = await this.db.models.uploadsStatus.findOne({
      userCid: cid,
      status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.PENDING,
      type: AppTypes.AssetsSerivce.UploadsStatus.UploadType.USERS_ASSETS,
    });
    if (existingUpload) {
      throw new ConflictException('Already uploading assets');
    }
    const uploadStatus = await this.db.models.uploadsStatus.create({
      status: AppTypes.AssetsSerivce.UploadsStatus.UploadStatusType.PENDING,
      userCid: cid,
      type: AppTypes.AssetsSerivce.UploadsStatus.UploadType.USERS_ASSETS,
    });

    return uploadStatus.toObject().id;
  }

  public async userProfilePictureUploadHandler(
    cid: string,
    uploadId: string,
    image: Express.Multer.File,
  ) {
    const user = await this.db.models.users.findOne({ cid: cid }).populate<{
      profilePicture?: AppTypes.AssetsSerivce.UserAssets.IUserAssets;
    }>('profilePicture' satisfies keyof AppTypes.AssetsSerivce.Users.IUser);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { objectKey, sizes } = await this.userAssetsUploader.uploadAvatar(
      cid,
      image.buffer,
    );
    if (user.profilePicture) {
      await this.userAssetsUploader.deleteUserProfilePicture(
        user.profilePicture.assetKey,
      );
    }
    await this.db.session(async (session) => {
      const [asset] = await this.db.models.userAssets.create(
        [
          {
            assetKey: objectKey,
            sizes: sizes,
            type: AppTypes.AssetsSerivce.Other.AssetType.IMAGE,
            urls: sizes.map((size) =>
              AssetsUploaders.UserAssetsUploader.getAvatarUrl(objectKey, size),
            ),
            userCid: cid,
            uploadId: new mongoose.Types.ObjectId(uploadId),
          },
        ],
        { session },
      );
      asset;
      await this.db.models.users.findOneAndUpdate(
        { cid: cid },
        {
          $set: {
            profilePicture: asset.id,
          },
        },
        { session },
      );
    });

    return objectKey;
  }
}
