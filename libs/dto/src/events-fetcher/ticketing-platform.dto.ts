import {
  ITicketingPlatform,
  ISafeApiKey,
  IApiKey,
  ISafeTicketingPlatform,
} from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import {
  DateField,
  EmailField,
  IdField,
  PasswordField,
  StringField,
} from '../decorators';

export class TicketingPlatformResponseDto implements ISafeTicketingPlatform {
  @IdField()
  id: string;
  @StringField()
  title: string;
  @StringField()
  websiteUrl: string;
  @StringField({
    optional: true,
  })
  image?: string | undefined;
  @StringField({
    optional: true,
  })
  banner?: string | undefined;
  @StringField({
    optional: true,
  })
  description?: string | undefined;
}

export class CreateTicketingPlatformRequestDto
  implements Omit<ITicketingPlatform, 'id'>
{
  @EmailField()
  email: string;
  @PasswordField()
  password: string;

  @StringField()
  title: string;
  @StringField()
  websiteUrl: string;
  @StringField({
    optional: true,
  })
  image?: string | undefined;
  @StringField({
    optional: true,
  })
  banner?: string | undefined;
  @StringField({
    optional: true,
  })
  description?: string | undefined;
}

export class CreateTicketingPlatformResponseDto {
  @ApiProperty({
    type: TicketingPlatformResponseDto,
  })
  platform: TicketingPlatformResponseDto;
  @StringField({
    description: 'Access token',
  })
  at: string;
}

export class LoginPlatformRequestDto {
  @StringField()
  password: string;
  @EmailField()
  email: string;
}

export class LoginPlatformResponseDto {
  @ApiProperty({
    type: TicketingPlatformResponseDto,
  })
  platform: TicketingPlatformResponseDto;
  @StringField({
    description: 'Access token',
  })
  at: string;
}

export class RefreshDashboardAtResponseDto {
  @StringField()
  at: string;
}

export class IssueApiKeyRequestDto
  implements Pick<IApiKey, 'title' | 'description'>
{
  @StringField()
  title: string;
  @StringField()
  description: string;
}

export class RevokeApiKeyRequestDto implements Pick<IApiKey, 'key'> {
  @StringField()
  key: string;
}

export class IssueApiKeyResponseDto
  implements
    Pick<
      IApiKey,
      'id' | 'title' | 'description' | 'expires' | 'createdAt' | 'key'
    >
{
  @StringField({
    description: 'api key',
  })
  key: string;

  @IdField()
  id: string;
  @StringField()
  title: string;
  @StringField()
  description: string;
  @DateField()
  createdAt: Date;
  @DateField({
    optional: true,
  })
  expires?: Date | undefined;
}

export class ApiKeyResponseDto implements ISafeApiKey {
  @IdField()
  id: string;
  @StringField()
  title: string;
  @StringField()
  description: string;
  @DateField()
  createdAt: Date;
  @DateField({
    optional: true,
  })
  expires?: Date | undefined;
}
