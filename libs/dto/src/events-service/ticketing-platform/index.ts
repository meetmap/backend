import {
  DateField,
  EmailField,
  IdField,
  NestedField,
  NumberField,
  PasswordField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatsResponseDto, LocationResponseDto } from '../events';

export class EventForOrganizersResponseDto
  implements
    Pick<
      AppTypes.EventsService.Event.IEvent,
      | 'id'
      | 'slug'
      | 'title'
      | 'picture'
      | 'startTime'
      | 'endTime'
      | 'ageLimit'
      | 'creator'
      | 'location'
      | 'eventType'
    >
{
  @IdField()
  id: string;
  @StringField()
  slug: string;
  @StringField()
  title: string;
  @StringField({ optional: true })
  picture?: string | undefined;

  @DateField()
  startTime: Date;
  @DateField()
  endTime: Date;
  @NumberField()
  ageLimit: number;
  @NestedField(LocationResponseDto)
  location: LocationResponseDto;
  @StringField({
    enum: AppTypes.EventsService.Event.EventType,
  })
  eventType: AppTypes.EventsService.Event.EventType;
  @NestedField(EventStatsResponseDto, {})
  stats: EventStatsResponseDto;
}

export class TicketingPlatformResponseDto
  implements AppTypes.TicketingPlatforms.System.ISafeTicketingPlatform
{
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
  implements Omit<AppTypes.TicketingPlatforms.System.ITicketingPlatform, 'id'>
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
  @NestedField(TicketingPlatformResponseDto)
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
  implements
    Pick<AppTypes.TicketingPlatforms.System.IApiKey, 'title' | 'description'>
{
  @StringField()
  title: string;
  @StringField()
  description: string;
}

export class RevokeApiKeyRequestDto
  implements Pick<AppTypes.TicketingPlatforms.System.IApiKey, 'key'>
{
  @StringField()
  key: string;
}

export class IssueApiKeyResponseDto
  implements
    Pick<
      AppTypes.TicketingPlatforms.System.IApiKey,
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

export class ApiKeyResponseDto
  implements AppTypes.TicketingPlatforms.System.ISafeApiKey
{
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
      AppTypes.EventsService.Event.IEvent,
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
