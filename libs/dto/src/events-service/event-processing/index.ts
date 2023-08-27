import { BaseDto } from '@app/dto/base';
import {
  DateField,
  NestedField,
  NumberField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';
import { EventResponseDto } from '../events';

class CreateEventLocationRequestDto extends BaseDto {
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

class CreateEventTicketRequestDto extends BaseDto {
  @StringField()
  name: string;
  @NumberField({ max: 100000 })
  price: number;
  @NumberField({ max: 1000000, min: -1 })
  amount: number;
  @StringField({ optional: true })
  description?: string;
}

export class CreateEventRequestDto extends BaseDto {
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
    min: 0,
    max: 120,
  })
  ageLimit: number;
  @NestedField(CreateEventLocationRequestDto)
  location: CreateEventLocationRequestDto;
  @NestedField([CreateEventTicketRequestDto], { maxLength: 10 })
  tickets: CreateEventTicketRequestDto[];

  @StringField({
    isArray: true,
    maxArrayLength: 15,
    description:
      "Maximum 15 tags, if empty array, server will assing tags automatically, based on event's contents",
  })
  tagsCids: string[];
}

export class UpdateEventRequestDto extends BaseDto {
  @StringField()
  cid: string;

  @StringField({ optional: true })
  title?: string;
  @StringField({ optional: true, nullable: true })
  description?: string | null;
  @StringField({
    enum: AppTypes.EventsService.Event.EventAccessibilityType,
    optional: true,
  })
  accessibility?: AppTypes.EventsService.Event.EventAccessibilityType;
  @DateField({ optional: true })
  startTime?: Date;
  @DateField({ optional: true })
  endTime?: Date;
  @NumberField({
    min: 0,
    max: 120,
    optional: true,
  })
  ageLimit?: number;
  @NestedField(CreateEventLocationRequestDto, {
    optional: true,
  })
  location?: CreateEventLocationRequestDto;
  @NestedField([CreateEventTicketRequestDto], { maxLength: 10, optional: true })
  tickets?: CreateEventTicketRequestDto[];

  @StringField({
    isArray: true,
    maxArrayLength: 15,
    optional: true,
    description:
      "Maximum 15 tags, if empty array, server will assing tags automatically, based on event's contents",
  })
  tagsCids?: string[];
}

export class CreateUserEventRequestDto extends CreateEventRequestDto {}
export class CreateTicketingPlatformEventRequestDto extends CreateEventRequestDto {
  @StringField()
  slug: string;
  @StringField({
    isArray: true,
    maxArrayLength: 10,
    minArrayLength: 1,
  })
  assetsUrls: string[];

  @StringField()
  link: string;
}
export class UpdateUserEventRequestDto extends UpdateEventRequestDto {}
export class UpdateTicketingPlatformEventRequestDto extends UpdateEventRequestDto {
  @StringField({
    isArray: true,
    maxArrayLength: 10,
    minArrayLength: 1,
    optional: true,
  })
  assetsUrls?: string[];
  @StringField({ optional: true })
  link?: string;
}

export class EventProcessingStatusResponseDto extends BaseDto {
  @StringField()
  cid: string;

  @StringField({
    enum: AppTypes.EventsService.EventProcessing.ProcessingType,
  })
  type: AppTypes.EventsService.EventProcessing.ProcessingType;

  @StringField({
    enum: AppTypes.EventsService.EventProcessing.ProcessingStatus,
  })
  current: AppTypes.EventsService.EventProcessing.ProcessingStatus;

  @StringField({
    enum: AppTypes.EventsService.EventProcessing.ProcessingStatus,
    optional: true,
  })
  next?: AppTypes.EventsService.EventProcessing.ProcessingStatus;

  @StringField({
    optional: true,
  })
  failureReason?: string;

  @NestedField(EventResponseDto, { optional: true })
  event?: EventResponseDto;
}
