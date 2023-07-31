import { AssetsServiceDatabase } from '@app/database';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AssetsUploaderDal {
  constructor(
    private readonly userAssetsUploader: AssetsUploaders.UserAssetsUploader,
    private readonly db: AssetsServiceDatabase,
  ) {}

  public async uploadUserProfilePicture(
    cid: string,
    image: Express.Multer.File,
  ) {
    const user = await this.db.models.users.findOne({ cid: cid }).populate<{
      profilePicture?: AppTypes.AssetsSerivce.UserAssets.IUserAssets;
    }>('profilePicture' satisfies keyof AppTypes.AssetsSerivce.Users.IUser);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.profilePicture) {
      await this.userAssetsUploader.deleteUserProfilePicture(
        user.profilePicture.assetKey,
      );
    }
    const { objectKey, sizes } = await this.userAssetsUploader.uploadAvatar(
      cid,
      image.buffer,
    );
    const asset = await this.db.models.userAssets.create({
      assetKey: objectKey,
      sizes: sizes,
      type: AppTypes.AssetsSerivce.Other.AssetType.IMAGE,
      urls: sizes.map((size) =>
        AssetsUploaders.UserAssetsUploader.getAvatarUrl(objectKey, size),
      ),
      userCid: cid,
    });
    user.profilePicture = asset.id;
    await user.save();
    return objectKey;
  }
}
