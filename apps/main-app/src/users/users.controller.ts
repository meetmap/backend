import {
  ExtractJwtPayload,
  JwtService,
  UseMicroserviceAuthGuard,
} from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
// import {
//   Nack,
//   RabbitPayload,
//   RabbitRequest,
//   RabbitSubscribe,
//   RequestOptions,
// } from '@app/rmq-lib';
import { UploadedImage, UseFileInterceptor } from '@app/dto/decorators';
import {
  UpdateUserProfilePictureRequestDto,
  UserPartialResponseDto,
  UserResponseDto,
} from '@app/dto/main-app/users.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common';
import { IJwtUserPayload } from '@app/types/jwt';
import {
  Nack,
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
    @RabbitPayload() payload: UserRmqRequestDto,
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

    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_CREATED) {
      await this.usersService.createUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED) {
      await this.usersService.updateUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED) {
      await this.usersService.deleteUser(payload.cid);
      return;
    } else {
      return new Nack(true);
    }
  }
  //@todo on update users profile picture send an event without updating db
  // @ApiOkResponse({
  //   type: UpdateUserLocationDto,
  //   description: 'Update user location dto',
  // })
  // @UseMicroserviceAuthGuard()
  // @Post('update-location')
  // public async updateUserLocation(
  //   @Body() body: UpdateUserLocationDto,
  //   @ExtractJwtPayload() jwt: IJwtUserPayload,
  // ): Promise<UpdateUserLocationDto> {
  //   return this.usersService.updateUserLocation(jwt.sub, body);
  // }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Self user response',
  })
  @UseMicroserviceAuthGuard()
  @Get('me')
  public async getUserSelf(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserSelf(jwt.cid);
  }

  @ApiOkResponse({
    type: [UserPartialResponseDto],
    description: 'Find users response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/find')
  public async findUsers(
    @Query('q') query: string,
  ): Promise<UserPartialResponseDto[]> {
    if (!query) {
      return [];
    }
    return this.usersService.findUsers(query);
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Find user response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/get/:userCid')
  public async getUserById(
    @Param('userCid') userCid: string,
  ): Promise<UserResponseDto> {
    if (!userCid) {
      throw new BadRequestException('Invalid userId');
    }
    return this.usersService.getUserByCid(userCid);
  }

  @ApiOkResponse({
    type: UserResponseDto,
  })
  @UseMicroserviceAuthGuard()
  @Post('/profile/picture')
  @ApiConsumes('multipart/form-data')
  @UseFileInterceptor('photo')
  public async updateUserProfilePicture(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
    @UploadedImage()
    file: Express.Multer.File,
    @Body() payload: UpdateUserProfilePictureRequestDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.updateUserProfilePicture(jwt.cid, file);
    // return this.usersService.getUserByCid(userCid);
  }
}
