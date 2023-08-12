import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { ParsePagePipe } from '@app/dto/pipes';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_CREATED],
    queue: 'users-service.users.created',
  })
  public async handleUserCreated(
    @RabbitPayload()
    payload: AppDto.TransportDto.Users.UserCreatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUserCreated.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    await this.usersService.createUser(payload);
    return;
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_DELETED,
    ],
    queue: 'users-service.users.updated',
  })
  public async handleUserUpdated(
    @RabbitPayload()
    payload /* : AppDto.TransportDto.Users.UserUpdatedRmqRequestDto */,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUserUpdated.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED) {
      await this.usersService.handleUpdateUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED) {
      await this.usersService.deleteUser(payload.cid);
      return;
    } else {
      throw new Error('Invalid routing key');
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey: [
      RMQConstants.exchanges.ASSETS.routingKeys.PROFILE_PICTURE_UPDATED,
    ],
    queue: 'users-service.assets.profile-picture-updated',
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
    type: AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto,
    description: 'Self user response',
  })
  @UseMicroserviceAuthGuard()
  @Get('me')
  public async getUserSelf(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto> {
    return this.usersService.getUserSelf(jwt.cid);
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto,
    description: 'Find users response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/find')
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async findUsers(
    @Query('q') query: string,
    @Query('page', new ParsePagePipe()) page: number,
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto> {
    if (!query) {
      return {
        paginatedResults: [],
        totalCount: 0,
        nextPage: undefined,
      };
    }
    return this.usersService.findUsers(jwt.cid, query, page);
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto,
    description: 'Find user response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/get/:userCid')
  public async getUserById(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Param('userCid') userCid: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto> {
    if (!userCid) {
      throw new BadRequestException('Invalid userId');
    }
    return this.usersService.getUserByCid(jwt.cid, userCid);
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto,
    description: 'Self user response',
  })
  @UseMicroserviceAuthGuard()
  @Patch('update')
  public async updateUser(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Body() payload: AppDto.UsersServiceDto.UsersDto.UpdateUserRequestDto,
  ) {
    return await this.usersService.updateUser(jwt.cid, payload);
  }
}
