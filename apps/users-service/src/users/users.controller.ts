import {
  ExtractJwtPayload,
  JwtService,
  UseMicroserviceAuthGuard,
} from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
// import {
//   Nack,
//   RabbitPayload,
//   RabbitRequest,
//   RabbitSubscribe,
//   RequestOptions,
// } from '@app/rmq-lib';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.USERS.routingKeys.USER_CREATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_DELETED,
    ],
    queue: RMQConstants.exchanges.USERS.queues.USER_SERVICE,
  })
  public async handleUser(
    @RabbitPayload() payload: AppDto.TransportDto.Users.UserRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUser.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      if (
        routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_CREATED
      ) {
        await this.usersService.createUser(payload);
        return;
      }
      if (
        routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED
      ) {
        await this.usersService.updateUser(payload);
        return;
      }
      if (
        routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED
      ) {
        await this.usersService.deleteUser(payload.cid);
        return;
      } else {
        return new Error('Invalid routing key');
      }
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey: [
      RMQConstants.exchanges.ASSETS.routingKeys.PROFILE_PICTURE_UPDATED,
    ],
    queue: RMQConstants.exchanges.ASSETS.queues.USER_SERVICE_ASSET_UPLOADED,
  })
  public async handleProfilePictureUpdated(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.ProfilePictureUpdatedRmqRequestDto,
  ) {
    await this.usersService.updateUserProfilePicture(
      payload.cid,
      payload.assetKey,
    );
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserResponseDto,
    description: 'Self user response',
  })
  @UseMicroserviceAuthGuard()
  @Get('me')
  public async getUserSelf(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto> {
    return this.usersService.getUserSelf(jwt.cid);
  }

  @ApiOkResponse({
    type: [AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto],
    description: 'Find users response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/find')
  public async findUsers(
    @Query('q') query: string,
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto[]> {
    if (!query) {
      return [];
    }
    return this.usersService.findUsers(jwt.cid, query);
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserResponseDto,
    description: 'Find user response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/get/:userCid')
  public async getUserById(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Param('userCid') userCid: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto> {
    if (!userCid) {
      throw new BadRequestException('Invalid userId');
    }
    return this.usersService.getUserByCid(jwt.cid, userCid);
  }

  // @ApiOkResponse({
  //   type: AppDto.UsersServiceDto.UsersDto.UserResponseDto,
  // })
  // @UseMicroserviceAuthGuard()
  // @Post('/profile/picture')
  // @ApiConsumes('multipart/form-data')
  // @UseFileInterceptor('photo')
  // public async updateUserProfilePicture(
  //   @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  //   @UploadedImage()
  //   file: Express.Multer.File,
  //   @Body()
  //   payload: AppDto.UsersServiceDto.UsersDto.UpdateUserProfilePictureRequestDto,
  // ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto> {
  //   return await this.usersService.updateUserProfilePicture(jwt.cid, file);
  //   // return this.usersService.getUserByCid(userCid);
  // }
}
