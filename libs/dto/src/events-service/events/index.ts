import { BaseDto } from '@app/dto/base';
import {
  BooleanField,
  DateField,
  IdField,
  NestedField,
  NumberField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EventTagResponseDto
  extends BaseDto
  implements AppTypes.EventsService.EventTags.ISafeTag
{
  @IdField()
  cid: string;
  @IsString()
  label: string;
}

export class EventUserStatsResponseDto
  extends BaseDto
  implements
    Pick<
      AppTypes.EventsService.EventsUsers.IEventsUsers,
      'isUserLike' | 'userStatus'
    >
{
  @BooleanField()
  isUserLike: boolean;
  @StringField({
    enum: AppTypes.EventsService.EventsUsers.EventsUsersStatusType,
    optional: true,
  })
  userStatus?: AppTypes.EventsService.EventsUsers.EventsUsersStatusType;
}

export class GetEventsByLocationRequestDto extends BaseDto {
  @NumberField()
  latitude: number;
  @NumberField()
  longitude: number;
  /**
   * @description in kilometeres
   */
  @NumberField({
    max: 90,
    min: 1,
    description: 'In kilometeres',
  })
  radius: number;
}

export class PointResponseDto
  extends BaseDto
  implements AppTypes.Shared.Location.IPoint
{
  @StringField({
    enum: ['Point'],
  })
  type: 'Point';
  @ApiProperty({
    type: [Number],
    minItems: 2,
    maxItems: 2,
    description: '[langitude, latitude]',
  })
  coordinates: [number, number];
}

export class LocationResponseDto
  extends BaseDto
  implements Omit<AppTypes.Shared.Location.ILocation, 'cityId'>
{
  @StringField()
  country: string;
  @StringField({ optional: true })
  city?: string;
  @NestedField(PointResponseDto)
  coordinates: PointResponseDto;
}

export class PriceDto
  extends BaseDto
  implements AppTypes.EventsService.Event.IPrice
{
  @StringField()
  currency: string;
  @NumberField()
  amount: number;
}

export class TicketDto
  extends BaseDto
  implements AppTypes.EventsService.Event.ITicket
{
  @StringField()
  name: string;
  @StringField({ optional: true })
  description?: string | undefined;
  @NestedField(PriceDto)
  price: PriceDto;
  @NumberField({
    min: -1,
    description: `-1 means Infinity; 0 means OOS; `,
  })
  amount: number;
}

export class CreatorResponseDto
  extends BaseDto
  implements AppTypes.EventsService.Event.ICreator
{
  type: AppTypes.EventsService.Event.CreatorType;
  creatorCid: string;
}

export class MinimalEventByLocationResponseDto
  extends BaseDto
  implements
    Pick<
      AppTypes.EventsService.Event.IMinimalEventByLocation,
      'id' | 'thumbnail' | 'coordinates'
    >
{
  @IdField()
  id: string;
  @ApiProperty({
    type: [Number],
    minItems: 2,
    maxItems: 2,
    description: '[longitude, latitude]',
  })
  coordinates: [number, number];
  @StringField({ optional: true })
  thumbnail?: string | undefined;
}

export class EventResponseDto
  extends BaseDto
  implements
    Pick<
      AppTypes.EventsService.Event.IEvent,
      | 'id'
      | 'slug'
      | 'title'
      | 'startTime'
      | 'endTime'
      | 'ageLimit'
      | 'creator'
      | 'location'
      | 'eventType'
      | 'description'
      | 'accessibility'
      | 'cid'
    >
{
  @IdField()
  id: string;
  @IdField()
  cid: string;
  @StringField()
  slug: string;
  @StringField()
  title: string;
  @StringField({ optional: true })
  thumbnail?: string | undefined;

  @DateField()
  startTime: Date;
  @DateField()
  endTime: Date;
  @NumberField()
  ageLimit: number;
  @NestedField(CreatorResponseDto, {
    optional: true,
  })
  creator?: CreatorResponseDto;
  @NestedField(LocationResponseDto)
  location: LocationResponseDto;
  @StringField({
    enum: AppTypes.EventsService.Event.EventType,
  })
  eventType: AppTypes.EventsService.Event.EventType;
  @NestedField(EventUserStatsResponseDto, {})
  userStats: EventUserStatsResponseDto;

  @StringField({ optional: true })
  description?: string | undefined;
  @StringField({
    enum: AppTypes.EventsService.Event.EventAccessibilityType,
  })
  accessibility: AppTypes.EventsService.Event.EventAccessibilityType;

  @NestedField([EventTagResponseDto])
  tags: EventTagResponseDto[];
}

export class EventPaginatedResponseDto
  extends BaseDto
  implements
    AppTypes.Other.PaginatedResponse.IPaginatedResponse<EventResponseDto>
{
  @NestedField([EventResponseDto])
  paginatedResults: EventResponseDto[];
  @NumberField()
  totalCount: number;
  @NumberField({ optional: true })
  nextPage?: number | undefined;
}

export class EventTagWithMetadataResponseDto
  extends BaseDto
  implements AppTypes.EventsService.EventTags.ISafeTagWithMetadata
{
  @StringField()
  label: string;
  @StringField()
  cid: string;
  @NumberField()
  count: number;
}

export class EventTagWithMetadataPaginatedResponseDto
  extends BaseDto
  implements
    AppTypes.Other.PaginatedResponse
      .IPaginatedResponse<EventTagWithMetadataResponseDto>
{
  @NestedField([EventTagWithMetadataResponseDto])
  paginatedResults: EventTagWithMetadataResponseDto[];
  @NumberField()
  totalCount: number;
  @NumberField({ optional: true })
  nextPage?: number | undefined;
}

export class EventStatsResponseDto
  extends BaseDto
  implements AppTypes.EventsService.Event.IEventStats
{
  @NumberField()
  likes: number;

  @NumberField()
  ticketsPurchased: number;

  @NumberField()
  wantGo: number;
}

export class SingleEventResponseDto
  extends BaseDto
  implements Omit<AppTypes.EventsService.Event.IEvent, 'tagsCids'>
{
  @IdField()
  id: string;
  @IdField()
  cid: string;
  @StringField()
  slug: string;
  @StringField({
    optional: true,
  })
  link?: string;
  @StringField()
  title: string;
  @StringField({ optional: true })
  thumbnail?: string | undefined;
  @StringField({ isArray: true })
  assets: string[];
  @StringField({ optional: true })
  description?: string | undefined;
  @DateField()
  startTime: Date;
  @DateField()
  endTime: Date;
  @NumberField()
  ageLimit: number;

  @StringField({ enum: AppTypes.EventsService.Event.EventAccessibilityType })
  accessibility: AppTypes.EventsService.Event.EventAccessibilityType;

  @NestedField(CreatorResponseDto, {
    optional: true,
  })
  creator?: CreatorResponseDto;
  @NestedField(LocationResponseDto)
  location: LocationResponseDto;
  @StringField({
    enum: AppTypes.EventsService.Event.EventType,
  })
  eventType: AppTypes.EventsService.Event.EventType;
  @NestedField([TicketDto])
  tickets: TicketDto[];
  @NestedField(EventStatsResponseDto, {})
  stats: EventStatsResponseDto;

  @NestedField(EventUserStatsResponseDto, {})
  userStats: EventUserStatsResponseDto;
  @DateField()
  createdAt: Date;
  @DateField()
  updatedAt: Date;

  @NestedField([EventTagResponseDto])
  tags: EventTagResponseDto[];
}

class CreateUserEventLocationRequestDto extends BaseDto {
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

class CreateUserEventTicketRequestDto extends BaseDto {
  @StringField()
  name: string;
  @NumberField({ max: 100000 })
  price: number;
  @NumberField({ max: 1000000, min: -1 })
  amount: number;
  @StringField({ optional: true })
  description?: string;
}

export class CreateUserEventRequestDto extends BaseDto {
  @StringField()
  title: string;
  @StringField({ optional: true })
  description?: string;
  @StringField({ enum: AppTypes.EventsService.Event.EventAccessibilityType })
  accessibility: AppTypes.EventsService.Event.EventAccessibilityType;
  @DateField()
  startTime: Date;
  @DateField()
  endTime: Date;
  @NumberField({
    min: 1,
    max: 120,
  })
  ageLimit: number;
  @NestedField(CreateUserEventLocationRequestDto)
  location: CreateUserEventLocationRequestDto;
  @NestedField([CreateUserEventTicketRequestDto], { maxLength: 10 })
  tickets: CreateUserEventTicketRequestDto[];

  @StringField({
    isArray: true,
    maxArrayLength: 15,
    description:
      "Maximum 15 tags, if empty array, server will assing tags automatically, based on event's contents",
  })
  tagsCids: string[];
}
