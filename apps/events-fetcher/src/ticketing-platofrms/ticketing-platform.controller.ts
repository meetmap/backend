import {
  ExtractPlatform,
  UseDashboardAuthGuard,
} from '@app/auth/dashboard-jwt';
import {
  IssueApiKeyRequestDto,
  IssueApiKeyResponseDto,
  CreateTicketingPlatformRequestDto,
  CreateTicketingPlatformResponseDto,
  LoginPlatformRequestDto,
  LoginPlatformResponseDto,
  RefreshDashboardAtResponseDto,
  RevokeApiKeyRequestDto,
} from '@app/dto/events-fetcher/ticketing-platform.dto';
import { ITicketingPlatform } from '@app/types';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { TicketingPlatformService } from './ticketing-platform.service';
import ms from 'ms';
@Controller('ticketing-platform')
export class TicketingPlatformController {
  constructor(
    private readonly ticketingPlatformService: TicketingPlatformService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOkResponse({
    type: CreateTicketingPlatformResponseDto,
    description: 'User will get refresh token from "refreshToken" cookie',
  })
  @Post('/signup')
  public async createPlatform(
    @Res({ passthrough: true }) res: Response,
    @Body() createTicketingPlatofrmDto: CreateTicketingPlatformRequestDto,
  ): Promise<CreateTicketingPlatformResponseDto> {
    const platform = await this.ticketingPlatformService.createPlatform(
      createTicketingPlatofrmDto,
    );
    const tokens = await this.ticketingPlatformService.getTokensAndRefreshRT(
      platform,
    );
    res.cookie('refreshToken', tokens.rt, {
      maxAge: ms(
        this.configService.getOrThrow<string>('DASHBOARD_JWT_RT_EXPIRES'),
      ),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return {
      platform,
      at: tokens.at,
    };
  }

  @ApiOkResponse({
    type: LoginPlatformResponseDto,
    description: 'User will get refresh token from "refreshToken" cookie',
  })
  @Post('/signin')
  public async loginPlatform(
    @Body() payload: LoginPlatformRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginPlatformResponseDto> {
    const platform = await this.ticketingPlatformService.loginPlatform(payload);
    const tokens = await this.ticketingPlatformService.getTokensAndRefreshRT(
      platform,
    );
    res.cookie('refreshToken', tokens.rt, {
      maxAge: ms(
        this.configService.getOrThrow<string>('DASHBOARD_JWT_RT_EXPIRES'),
      ),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return {
      platform,
      at: tokens.at,
    };
  }

  @ApiOkResponse({
    type: RefreshDashboardAtResponseDto,
    description:
      'User will get access token, need to have valid refreshToken in cookies',
  })
  @Post('/refresh')
  async refreshAccessToken(
    @Req() req: Request,
  ): Promise<RefreshDashboardAtResponseDto> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ForbiddenException('refresh token not provided');
    }

    const at = await this.ticketingPlatformService.refreshAccessToken(
      refreshToken,
    );
    return {
      at,
    };
  }

  @UseDashboardAuthGuard()
  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @ExtractPlatform() platform: ITicketingPlatform,
  ): Promise<void> {
    await this.ticketingPlatformService.updatePlatformsRefreshToken(
      platform.id,
      null,
    );
    res.cookie('refreshToken', '', {
      maxAge: -1,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }

  @ApiOkResponse({ type: IssueApiKeyResponseDto })
  @Post('/api-key')
  @UseDashboardAuthGuard()
  public async issueApiKey(
    @Body() payload: IssueApiKeyRequestDto,
    @ExtractPlatform() platform: ITicketingPlatform,
  ): Promise<IssueApiKeyResponseDto> {
    return this.ticketingPlatformService.issueApiKey(platform.id, payload);
  }

  @ApiOkResponse({})
  @Delete('/api-key')
  @UseDashboardAuthGuard()
  public async revokeApiKey(
    @Body() payload: RevokeApiKeyRequestDto,
    @ExtractPlatform() platform: ITicketingPlatform,
  ): Promise<void> {
    return this.ticketingPlatformService.revokeApiKey(platform.id, payload);
  }
}
