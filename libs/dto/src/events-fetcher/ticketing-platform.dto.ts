import {
  ITicketingPlatform,
  ISafeApiKey,
  IApiKey,
  ISafeTicketingPlatform,
  IEvent,
  EventType,
  ICreator,
  ILocation,
  ITicket,
} from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import {
  DateField,
  EmailField,
  IdField,
  NestedField,
  NumberField,
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

export class EventLocationDto {
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

export class TicketRequestDto {
  @StringField()
  name: string;
  @NumberField({
    max: 100000,
  })
  price: number;
  @NumberField({
    min: -1,
    max: 1000000,
  })
  amount: number;
  @StringField({
    optional: true,
  })
  description?: string;
}

export class UploadEventRequestDto
  implements
    Pick<
      IEvent,
      | 'link'
      | 'title'
      | 'picture'
      | 'description'
      | 'startTime'
      | 'endTime'
      | 'ageLimit'
      // | 'tickets'
    >
{
  @StringField({
    optional: true,
  })
  link?: string | undefined;
  @StringField() title: string;
  @StringField({
    optional: true,
  })
  picture?: string | undefined;
  @StringField({
    optional: true,
  })
  description?: string | undefined;
  @DateField()
  startTime: Date;
  @DateField()
  endTime: Date;
  @NumberField()
  ageLimit: number;
  @NestedField(EventLocationDto)
  location: EventLocationDto;

  @NestedField([TicketRequestDto])
  tickets: TicketRequestDto[];
}
