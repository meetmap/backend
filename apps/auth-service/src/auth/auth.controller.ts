import { ExtractUser, JwtService, UseAuthGuard } from '@app/auth/jwt';
import {
  AuthUserResponseDto,
  CreateUserRequestDto,
  EntityIsFreeResponseDto,
  LinkFacebookRequestDto,
  LoginResponseDto,
  LoginWithAuthProviderRequestDto,
  LoginWithPasswordDto,
  RefreshAccessTokenRequestDto,
  RefreshAtResponseDto,
  SignUpWithAuthProviderRequestDto,
  UpdateUsersUsernameRequestDto,
} from '@app/dto/auth-service/auth.dto';
import { IAuthUser } from '@app/types';
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
  public async usernameIsFree(
    @Query('username') username: string,
  ): Promise<EntityIsFreeResponseDto> {
    const usernameIsFree = await this.authService.usernameIsFree(username);

    return { free: usernameIsFree };
  }
  @ApiOkResponse({
    type: EntityIsFreeResponseDto,
    description: 'Phone is free to use',
  })
  @Get('/check-phone/:phone')
  public async phoneIsFree(
    @Query('phone') phone: string,
  ): Promise<EntityIsFreeResponseDto> {
    const usernameIsFree = await this.authService.phoneIsFree(phone);

    return { free: usernameIsFree };
  }

  @ApiOkResponse({
    type: AuthUserResponseDto,
    description: 'User updated response',
  })
  @UseAuthGuard()
  @Put('username')
  public async updateUsersUsername(
    @Body() payload: UpdateUsersUsernameRequestDto,
    @ExtractUser() user: IAuthUser,
  ): Promise<AuthUserResponseDto> {
    return this.authService.updateUsersUsername(user.id, payload);
  }

  @ApiOkResponse({
    type: RefreshAtResponseDto,
    description: 'Refresh access token response',
  })
  @Post('refresh')
  public async refreshAccessToken(
    @Body() dto: RefreshAccessTokenRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshAtResponseDto> {
    const accessToken = await this.authService.refreshAccessToken(
      dto.refreshToken,
    );
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { accessToken };
  }

  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User created response',
  })
  @Post('/facebook/signup')
  public async signUpWithFacebook(
    @Body() payload: SignUpWithAuthProviderRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.signUpWithFacebook(payload);
    const tokens = await this.authService.getTokensAndRefreshRT(user);

    return {
      user,
      tokens,
    };
  }

  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User logged in response',
  })
  @Post('/facebook/signin')
  public async loginWithFacebook(
    @Body() payload: LoginWithAuthProviderRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.loginWithFacebook(payload);
    const tokens = await this.authService.getTokensAndRefreshRT(user);

    return {
      user,
      tokens,
    };
  }

  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User logged in response',
  })
  @Post('/facebook/link')
  @UseAuthGuard()
  public async linkFacebook(
    @Body() payload: LinkFacebookRequestDto,
    @ExtractUser() user: IAuthUser,
  ): Promise<AuthUserResponseDto> {
    const dbUser = await this.authService.linkFacebook(user, payload.token);
    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }
    return dbUser;
  }
}
