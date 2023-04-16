import { JwtService } from '@app/auth';
import { ExtractUser, UseAuthGuard } from '@app/auth/jwt';
import { InternalAxiosService } from '@app/axios';
import { IUser } from '@app/types';
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
import { Response } from 'express';
import {
  CreateUserRequestDto,
  EntityIsFreeResponseDto,
  LoginResponseDto,
  LoginWithPasswordDto,
  RefreshAccessTokenDto,
  RefreshRtResponseDto,
  TokensResponseDto,
  UpdateUserLocationDto,
  UpdateUsersUsernameDto,
  UserResponseDto,
} from './dto';
import { UsersService } from './users.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly internalAxios: InternalAxiosService,
  ) {}

  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User created response',
  })
  @Post('/create')
  public async createUser(
    @Body() payload: CreateUserRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.createUser(payload);
    const tokens = await this.usersService.getTokensAndRefreshRT(user);

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
    const user = await this.usersService.loginWithPassword(payload);
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    const responseUser = UsersService.mapUserDbToResponseUser(user);
    const tokens = await this.usersService.getTokensAndRefreshRT(user);
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
    const usernameIsFree = await this.usersService.usernameIsFree(username);

    return { free: usernameIsFree };
  }
  @ApiOkResponse({
    type: EntityIsFreeResponseDto,
    description: 'Phone is free to use',
  })
  @Get('/check-phone/:phone')
  public async phoneIsFree(@Query('phone') phone: string) {
    const usernameIsFree = await this.usersService.phoneIsFree(phone);

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
    @ExtractUser() user: IUser,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUsersUsername(user.id, payload);
  }

  @ApiOkResponse({
    type: RefreshRtResponseDto,
    description: 'Refresh accecc token response',
  })
  @Post('refresh')
  public async refreshAccessToken(
    @Body() dto: RefreshAccessTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshRtResponseDto> {
    const jwtPayload = await this.jwtService.verifyRt(dto.refreshToken);
    const accessToken = await this.jwtService.getAt(dto.refreshToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { accessToken };
  }

  @ApiOkResponse({
    type: UpdateUserLocationDto,
    description: 'UPdate user location dto',
  })
  @UseAuthGuard()
  @Post('update-location')
  public async updateUserLocation(
    @Body() body: UpdateUserLocationDto,
    @ExtractUser() user: IUser,
  ): Promise<UpdateUserLocationDto> {
    return this.usersService.updateUserLocation(user.id, body);
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Self user response',
  })
  @UseAuthGuard()
  @Get('me')
  public async getUserSelf(
    @ExtractUser() user: IUser,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserSelf(user.id);
  }
}
