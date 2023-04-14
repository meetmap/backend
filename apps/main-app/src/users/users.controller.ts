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
  LoginWithPasswordDto,
  RefreshAccessTokenDto,
  UpdateUserLocationDto,
  UpdateUsersUsernameDto,
} from './dto';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly internalAxios: InternalAxiosService,
  ) {}

  @Post('/create')
  public async createUser(@Body() payload: CreateUserRequestDto) {
    return this.usersService.createUser(payload);
  }

  @Post('/login')
  public async loginWithPassword(@Body() payload: LoginWithPasswordDto) {
    if (!(payload.username || payload.email || payload.phone)) {
      throw new BadRequestException(
        'You should use at least once login method by username, email or phone number',
      );
    }
    const user = await this.usersService.loginWithPassword(payload);
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    const jwt = await this.jwtService.getTokens({
      sub: user.id,
      username: user.username,
    });
    await this.usersService.updateUsersRefreshToken(user.id, jwt.rt);
    return jwt;
  }
  @Get('/check-username/:username')
  public async usernameIsFree(@Query('username') username: string) {
    const usernameIsFree = await this.usersService.usernameIsFree(username);

    return { free: usernameIsFree };
  }
  @Get('/check-phone/:phone')
  public async phoneIsFree(@Query('phone') phone: string) {
    const usernameIsFree = await this.usersService.phoneIsFree(phone);

    return { free: usernameIsFree };
  }

  @UseAuthGuard()
  @Put('username')
  public async updateUsersUsername(
    @Body() payload: UpdateUsersUsernameDto,
    @ExtractUser() user: IUser,
  ) {
    return this.usersService.updateUsersUsername(user.id, payload);
  }

  @Post('refresh')
  public async refreshAccessToken(
    @Body() dto: RefreshAccessTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtPayload = await this.jwtService.verifyRt(dto.refreshToken);
    const accessToken = await this.jwtService.getAt(dto.refreshToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { accessToken };
  }

  @UseAuthGuard()
  @Post('update-location')
  public async updateUserLocation(
    @Body() body: UpdateUserLocationDto,
    @ExtractUser() user: IUser,
  ) {
    return this.usersService.updateUserLocation(user.id, body);
  }
}
