import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { AppDto } from '@app/dto';
import { UploadedImage, UseFileInterceptor } from '@app/dto/decorators';
import { AppTypes } from '@app/types';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { AssetsUploaderService } from './assets-uploader.service';

@Controller('/upload')
export class AssetsUploaderController {
  constructor(private readonly assetsUploaderService: AssetsUploaderService) {}

  @ApiOkResponse({
    type: AppDto.AssetsServiceDto.AssetsUploaders
      .UploadProfilePictureResponseDto,
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
  ): Promise<AppDto.AssetsServiceDto.AssetsUploaders.UploadProfilePictureResponseDto> {
    return await this.assetsUploaderService.updateUserProfilePicture(
      jwt.cid,
      file,
    );
  }
}
