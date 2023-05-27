import { ExtractUser, JwtService, UseAuthGuard } from '@app/auth/jwt';
import { RabbitMQExchanges, RMQConstants } from '@app/constants';
import { IAuthUser, ISafeAuthUser } from '@app/types';
import { RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  CreateUserRequestDto,
  EntityIsFreeResponseDto,
  GetUserByIdBulkRmqRequestDto,
  GetUserByIdRmqRequestDto,
  LoginResponseDto,
  LoginWithPasswordDto,
  RefreshAccessTokenDto,
  RefreshAtResponseDto,
  UpdateUsersUsernameDto,
  UserResponseDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User created response',
  })
  @Post('/signup')
  public async createUser(
    @Body() payload: CreateUserRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.createUser(payload);
    const tokens = await this.authService.getTokensAndRefreshRT(user);

    return {
      user,
      tokens,
    };
  }

  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User created response',
  })
  @Post('/login')
  public async loginWithPassword(
    @Body() payload: LoginWithPasswordDto,
  ): Promise<LoginResponseDto> {
    if (!(payload.username || payload.email || payload.phone)) {
      throw new BadRequestException(
        'You should use at least once login method by username, email or phone number',
      );
    }
    const user = await this.authService.loginWithPassword(payload);
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    const responseUser = AuthService.mapUserDbToResponseUser(user);
    const tokens = await this.authService.getTokensAndRefreshRT(user);
    return {
      user: responseUser,
      tokens,
    };
  }
  @ApiOkResponse({
    type: EntityIsFreeResponseDto,
    description: 'Username is free to use',
  })
  @Get('/check-username/:username')
  public async usernameIsFree(@Query('username') username: string) {
    const usernameIsFree = await this.authService.usernameIsFree(username);

    return { free: usernameIsFree };
  }
  @ApiOkResponse({
    type: EntityIsFreeResponseDto,
    description: 'Phone is free to use',
  })
  @Get('/check-phone/:phone')
  public async phoneIsFree(@Query('phone') phone: string) {
    const usernameIsFree = await this.authService.phoneIsFree(phone);

    return { free: usernameIsFree };
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User updated response',
  })
  @UseAuthGuard()
  @Put('username')
  public async updateUsersUsername(
    @Body() payload: UpdateUsersUsernameDto,
    @ExtractUser() user: IAuthUser,
  ): Promise<UserResponseDto> {
    return this.authService.updateUsersUsername(user.id, payload);
  }

  @ApiOkResponse({
    type: RefreshAtResponseDto,
    description: 'Refresh access token response',
  })
  @Post('refresh')
  public async refreshAccessToken(
    @Body() dto: RefreshAccessTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshAtResponseDto> {
    const jwtPayload = await this.jwtService.verifyRt(dto.refreshToken);
    const accessToken = await this.jwtService.getAt(dto.refreshToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { accessToken };
  }

  // @RabbitRPC({
  //   exchange: RMQConstants.exchanges.AUTH_SERVICE.name,
  //   queue: RMQConstants.exchanges.AUTH_SERVICE.queues.USER.name,
  //   routingKey:
  //     RMQConstants.exchanges.AUTH_SERVICE.queues.USER.routes.GET_USER.name,
  // })
  // public async getUserById(
  //   @RabbitPayload() payload: GetUserByIdRmqRequestDto,
  // ): Promise<ISafeAuthUser | null> {
  //   return this.authService.getUserById(payload.userId);
  // }

  // @RabbitRPC({
  //   exchange: RMQConstants.exchanges.AUTH_SERVICE.name,
  //   queue: RMQConstants.exchanges.AUTH_SERVICE.queues.USER.name,
  //   routingKey:
  //     RMQConstants.exchanges.AUTH_SERVICE.queues.USER.routes.GET_USERS.name,
  // })
  // public async getUserByIdBulk(
  //   @RabbitPayload() payload: GetUserByIdBulkRmqRequestDto,
  // ): Promise<(ISafeAuthUser | null)[]> {
  //   return this.authService.getUserByIdBulk(payload.userIds);
  // }
}
