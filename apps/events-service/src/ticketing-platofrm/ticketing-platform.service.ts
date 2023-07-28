import { DashboardJwtService } from '@app/auth/dashboard-jwt';
import {
  ApiKeyResponseDto,
  CreateTicketingPlatformRequestDto,
  IssueApiKeyRequestDto,
  IssueApiKeyResponseDto,
  LoginPlatformRequestDto,
  RevokeApiKeyRequestDto,
  TicketingPlatformResponseDto,
} from '@app/dto/events-service/ticketing-platform.dto';
import {
  IApiKey,
  ISafeApiKey,
  ISafeTicketingPlatform,
  ITicketingPlatform,
} from '@app/types';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TicketingPlatformDal } from './ticketing-platform.dal';

@Injectable()
export class TicketingPlatformService {
  constructor(
    private readonly dashboardJwtService: DashboardJwtService,
    private readonly dal: TicketingPlatformDal,
  ) {}

  public async issueApiKey(
    platformId: string,
    payload: IssueApiKeyRequestDto,
  ): Promise<IssueApiKeyResponseDto> {
    const apiKey = await this.dal.issueApiKey(platformId, payload);
    if (!apiKey) {
      throw new InternalServerErrorException('Failed to create api key');
    }
    return {
      createdAt: apiKey.createdAt,
      description: apiKey.description,
      id: apiKey.id,
      title: apiKey.title,
      expires: apiKey.expires,
      key: apiKey.key,
    };
  }

  public async revokeApiKey(
    platformId: string,
    payload: RevokeApiKeyRequestDto,
  ) {
    const deletedApiKey = await this.dal.revokeApiKey(platformId, payload.key);
    if (!deletedApiKey) {
      throw new NotFoundException('Invalid api key');
    }
    return;
  }

  public async createPlatform(
    payload: CreateTicketingPlatformRequestDto,
  ): Promise<TicketingPlatformResponseDto> {
    //@todo make as event creation with zod and images uploading
    const platform = await this.dal.createPlatform(payload);
    return TicketingPlatformService.toSafeTicketingPlatformMapper(platform);
  }

  public async loginPlatform(payload: LoginPlatformRequestDto) {
    const platform = await this.dal.findPlatformByEmail(payload.email);
    if (!platform) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const isValidPassword = await this.dal.comparePassword(
      payload.password,
      platform.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    return TicketingPlatformService.toSafeTicketingPlatformMapper(platform);
  }

  public async refreshAccessToken(refreshToken: string) {
    const jwtPayload = await this.dashboardJwtService.verifyRt(refreshToken);
    const platform = await this.dal.findPlatformById(jwtPayload.sub);
    if (!platform || platform.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const at = await this.dashboardJwtService.getAt(refreshToken);
    return at;
  }

  public async getTokensAndRefreshRT(
    platform: Pick<ITicketingPlatform, 'id' | 'title'>,
  ) {
    const jwt = await this.dashboardJwtService.getTokens({
      companyName: platform.title,
      sub: platform.id,
    });
    await this.updatePlatformsRefreshToken(platform.id, jwt.rt);
    return jwt;
  }

  public async updatePlatformsRefreshToken(
    platformId: string,
    refreshToken: string | null,
  ) {
    return await this.dal.updatePlatformsRefreshToken(platformId, refreshToken);
  }

  public async getPlatformApiKeys(
    platformId: string,
  ): Promise<ApiKeyResponseDto[]> {
    const apiKeys = await this.dal.getPlatformApiKeys(platformId);
    return apiKeys.map((apiKey) =>
      TicketingPlatformService.toSafeApiKeyMapper(apiKey),
    );
  }

  static toSafeApiKeyMapper(apiKey: IApiKey): ISafeApiKey {
    return {
      createdAt: apiKey.createdAt,
      description: apiKey.description,
      id: apiKey.id,
      title: apiKey.title,
      expires: apiKey.expires,
    };
  }

  static toSafeTicketingPlatformMapper(
    platform: ITicketingPlatform,
  ): ISafeTicketingPlatform {
    return {
      id: platform.id,
      title: platform.title,
      websiteUrl: platform.websiteUrl,
      banner: platform.banner,
      description: platform.description,
      image: platform.image,
    };
  }
}
