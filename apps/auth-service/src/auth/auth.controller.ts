import { ExtractUser, UseAuthGuard } from '@app/auth/jwt';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
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
  constructor(private readonly authService: AuthService) {}

  // @RabbitSubscribe({
  //   exchange: RMQConstants.exchanges.USERS.name,
  //   routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED],
  //   queue: 'auth_service.users.update-handler',
  // })
  // public async userUpdatedHandler(
  //   @RabbitPayload() payload:AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  //   @RabbitRequest() req: { fields: RequestOptions },
  // ) {
  //   const routingKey = req.fields.routingKey;
  //   console.log({
  //     handler: this.userUpdatedHandler.name,
  //     routingKey: routingKey,
  //     msg: {
  //       cid: payload.cid,
  //     },
  //   });
  //   try {
  //     await this.usersService.handleUpdateUser(payload);
  //     return;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.SignInResponseDto,
    description: 'User created response',
  })
  @Post('/signup')
  public async createUser(
    @Body() payload: AppDto.AuthService.AuthDto.SignUpRequestDto,
  ): Promise<AppDto.AuthService.AuthDto.SignInResponseDto> {
    const user = await this.authService.createUser(payload);
    const tokens = await this.authService.getTokensAndRefreshRT(user);

    return {
      user,
      tokens,
    };
  }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.SignInResponseDto,
    description: 'User created response',
  })
  @Post('/login')
  public async loginWithPassword(
    @Body() payload: AppDto.AuthService.AuthDto.SignInWithPasswordRequestDto,
  ): Promise<AppDto.AuthService.AuthDto.SignInResponseDto> {
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
    type: AppDto.AuthService.AuthDto.EntityIsFreeResponseDto,
    description: 'Username is free to use',
  })
  @Get('/check-username/:username')
  public async usernameIsFree(
    @Query('username') username: string,
  ): Promise<AppDto.AuthService.AuthDto.EntityIsFreeResponseDto> {
    const usernameIsFree = await this.authService.usernameIsFree(username);

    return { free: usernameIsFree };
  }
  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.EntityIsFreeResponseDto,
    description: 'Phone is free to use',
  })
  @Get('/check-phone/:phone')
  public async phoneIsFree(
    @Query('phone') phone: string,
  ): Promise<AppDto.AuthService.AuthDto.EntityIsFreeResponseDto> {
    const usernameIsFree = await this.authService.phoneIsFree(phone);

    return { free: usernameIsFree };
  }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.UserResponseDto,
    description: 'User updated response',
  })
  @UseAuthGuard()
  @Put('username')
  public async updateUsersUsername(
    @Body() payload: AppDto.AuthService.AuthDto.UpdateUsernameRequestDto,
    @ExtractUser() user: AppTypes.AuthService.Users.IUser,
  ): Promise<AppDto.AuthService.AuthDto.UserResponseDto> {
    return this.authService.updateUsersUsername(user.cid, payload);
  }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.RefreshAccessTokenResponseDto,
    description: 'Refresh access token response',
  })
  @Post('refresh')
  public async refreshAccessToken(
    @Body() dto: AppDto.AuthService.AuthDto.RefreshAccessTokenRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppDto.AuthService.AuthDto.RefreshAccessTokenResponseDto> {
    const accessToken = await this.authService.refreshAccessToken(
      dto.refreshToken,
    );
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { accessToken };
  }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.SignInResponseDto,
    description: 'User created response',
  })
  @Post('/facebook/signup')
  public async signUpWithFacebook(
    @Body()
    payload: AppDto.AuthService.AuthDto.SignUpWithAuthProviderRequestDto,
  ): Promise<AppDto.AuthService.AuthDto.SignInResponseDto> {
    const user = await this.authService.signUpWithFacebook(payload);
    const tokens = await this.authService.getTokensAndRefreshRT(user);

    return {
      user,
      tokens,
    };
  }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.SignInResponseDto,
    description: 'User logged in response',
  })
  @Post('/facebook/signin')
  public async loginWithFacebook(
    @Body()
    payload: AppDto.AuthService.AuthDto.SignUpWithAuthProviderRequestDto,
  ): Promise<AppDto.AuthService.AuthDto.SignInResponseDto> {
    const user = await this.authService.loginWithFacebook(payload);
    const tokens = await this.authService.getTokensAndRefreshRT(user);

    return {
      user,
      tokens,
    };
  }

  @ApiOkResponse({
    type: AppDto.AuthService.AuthDto.UserResponseDto,
    description: 'User logged in response',
  })
  @Post('/facebook/link')
  @UseAuthGuard()
  public async linkFacebook(
    @Body() payload: AppDto.AuthService.AuthDto.LinkFacebookRequestDto,
    @ExtractUser() user: AppTypes.AuthService.Users.IUser,
  ): Promise<AppDto.AuthService.AuthDto.UserResponseDto> {
    const dbUser = await this.authService.linkFacebook(user, payload.token);
    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }
    return dbUser;
  }
}
