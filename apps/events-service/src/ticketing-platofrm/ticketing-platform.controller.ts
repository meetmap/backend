import { ExtractApiPlatform, UseApiAuthGuard } from '@app/auth/api-auth';
import {
  ExtractPlatform,
  UseDashboardAuthGuard,
} from '@app/auth/dashboard-jwt';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import ms from 'ms';
import { TicketingPlatformService } from './ticketing-platform.service';
@Controller('ticketing-platform')
export class TicketingPlatformController {
  constructor(
    private readonly ticketingPlatformService: TicketingPlatformService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.TicketingPlatformsDto
      .CreateTicketingPlatformResponseDto,
    description: 'User will get refresh token from "refreshToken" cookie',
  })
  @Post('/signup')
  public async createPlatform(
    @Res({ passthrough: true }) res: Response,
    @Body()
    createTicketingPlatofrmDto: AppDto.EventsServiceDto.TicketingPlatformsDto.CreateTicketingPlatformRequestDto,
  ): Promise<AppDto.EventsServiceDto.TicketingPlatformsDto.CreateTicketingPlatformResponseDto> {
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
    type: AppDto.EventsServiceDto.TicketingPlatformsDto
      .LoginPlatformResponseDto,
    description: 'User will get refresh token from "refreshToken" cookie',
  })
  @Post('/signin')
  public async loginPlatform(
    @Body()
    payload: AppDto.EventsServiceDto.TicketingPlatformsDto.LoginPlatformRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppDto.EventsServiceDto.TicketingPlatformsDto.LoginPlatformResponseDto> {
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
    type: AppDto.EventsServiceDto.TicketingPlatformsDto
      .RefreshDashboardAtResponseDto,
    description:
      'User will get access token, need to have valid refreshToken in cookies',
  })
  @Post('/refresh')
  async refreshAccessToken(
    @Req() req: Request,
  ): Promise<AppDto.EventsServiceDto.TicketingPlatformsDto.RefreshDashboardAtResponseDto> {
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
    @ExtractPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
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

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.TicketingPlatformsDto.IssueApiKeyResponseDto,
  })
  @Post('/api-key')
  @UseDashboardAuthGuard()
  public async issueApiKey(
    @Body()
    payload: AppDto.EventsServiceDto.TicketingPlatformsDto.IssueApiKeyRequestDto,
    @ExtractPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
  ): Promise<AppDto.EventsServiceDto.TicketingPlatformsDto.IssueApiKeyResponseDto> {
    return this.ticketingPlatformService.issueApiKey(platform.id, payload);
  }

  @ApiOkResponse({})
  @Delete('/api-key')
  @UseDashboardAuthGuard()
  public async revokeApiKey(
    @Body()
    payload: AppDto.EventsServiceDto.TicketingPlatformsDto.RevokeApiKeyRequestDto,
    @ExtractPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
  ): Promise<void> {
    return this.ticketingPlatformService.revokeApiKey(platform.id, payload);
  }

  @ApiOkResponse({
    type: [AppDto.EventsServiceDto.TicketingPlatformsDto.ApiKeyResponseDto],
  })
  @Get('/api-key')
  @UseDashboardAuthGuard()
  public async getPlatformApiKeys(
    @ExtractPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
  ): Promise<
    AppDto.EventsServiceDto.TicketingPlatformsDto.ApiKeyResponseDto[]
  > {
    return this.ticketingPlatformService.getPlatformApiKeys(platform.id);
  }

  @ApiOkResponse({
    type: [
      AppDto.EventsServiceDto.TicketingPlatformsDto
        .EventForOrganizersResponseDto,
    ],
  })
  @Get('/events')
  @UseApiAuthGuard()
  public async getEvents(
    @ExtractApiPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
  ): Promise<
    AppDto.EventsServiceDto.TicketingPlatformsDto.EventForOrganizersResponseDto[]
  > {
    throw new BadRequestException();
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.TicketingPlatformsDto
      .EventForOrganizersResponseDto,
  })
  @Get('/events/:id')
  @UseApiAuthGuard()
  public async getEvent(
    @Param('id') id: string,
    @ExtractApiPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
  ): Promise<AppDto.EventsServiceDto.TicketingPlatformsDto.EventForOrganizersResponseDto> {
    throw new BadRequestException();
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.TicketingPlatformsDto
      .EventForOrganizersResponseDto,
  })
  @Post('/upload-event')
  @UseApiAuthGuard()
  public async uploadEvent(
    @ExtractApiPlatform()
    platform: AppTypes.TicketingPlatforms.System.ITicketingPlatform,
    @Body()
    payload: AppDto.EventsServiceDto.TicketingPlatformsDto.UploadEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.TicketingPlatformsDto.EventForOrganizersResponseDto> {
    throw new BadRequestException();
  }
}
