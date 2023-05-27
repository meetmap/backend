import { JwtService } from '@app/auth';
import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { InternalAxiosService } from '@app/axios';
import { ISafeAuthUser, IUser } from '@app/types';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import {
  UpdateUserLocationDto,
  UserResponseDto,
  UserRmqRequestDto,
} from './dto';
import { UsersService } from './users.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { RMQConstants } from '@app/constants';
import {
  Nack,
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@app/rmq-lib';
import { IJwtUserPayload } from '@app/types/jwt';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly internalAxios: InternalAxiosService,
  ) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.USERS.queues.USER_SERVICE.routes.USER_CREATED,
      RMQConstants.exchanges.USERS.queues.USER_SERVICE.routes.USER_UPDATED,
    ],
    queue: RMQConstants.exchanges.USERS.queues.USER_SERVICE.name,
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
        authUserId: payload.authUserId,
      },
    });

    if (
      routingKey ===
      RMQConstants.exchanges.USERS.queues.USER_SERVICE.routes.USER_CREATED
    ) {
      await this.usersService.createUser(payload);
      return;
    }
    if (
      routingKey ===
      RMQConstants.exchanges.USERS.queues.USER_SERVICE.routes.USER_UPDATED
    ) {
      await this.usersService.updateUser(payload);
      return;
    } else {
      return new Nack(true);
    }
  }

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
    return this.usersService.getUserSelf(jwt.sub);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'Find users response',
  })
  @UseMicroserviceAuthGuard()
  @Get('/find')
  public async findUsers(
    @Query('q') query: string,
  ): Promise<UserResponseDto[]> {
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
  @Get('/get/:userId')
  public async getUserById(
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    if (!userId) {
      throw new BadRequestException('Invalid userId');
    }
    return this.usersService.getUserById(userId);
  }
}
