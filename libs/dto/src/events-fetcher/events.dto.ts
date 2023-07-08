import {
  CreatorType,
  EventAccessibilityType,
  EventsUsersStatusType,
  EventType,
  ICity,
  ICreator,
  IEvent,
  IEventStats,
  IEventsUsers,
  ILocation,
  IPoint,
  IPrice,
  ITicket,
} from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { PopulatedDoc, Types } from 'mongoose';
import { z } from 'zod';
import {
  BooleanField,
  DateField,
  IdField,
  NestedField,
  NumberField,
  StringField,
} from '../decorators';

export class EventUserStatsResponseDto
  implements Pick<IEventsUsers, 'isUserLike' | 'userStatus'>
{
  @BooleanField()
  isUserLike: boolean;
  @StringField({
    enum: EventsUsersStatusType,
    optional: true,
  })
  userStatus?: EventsUsersStatusType;
}

export class GetEventsByLocationRequestDto {
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

export class PointResponseDto implements IPoint {
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

export class LocationResponseDto implements ILocation {
  @StringField()
  country: string;
  @IdField({ optional: true })
  cityId?: PopulatedDoc<ICity, Types.ObjectId | undefined>;
  @NestedField(PointResponseDto)
  coordinates: PointResponseDto;
}

export class PriceDto implements IPrice {
  @StringField()
  currency: string;
  @NumberField()
  amount: number;
}

export class TicketDto implements ITicket {
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

export class CreatorResponseDto implements ICreator {
  type: CreatorType;
  creatorCid: string;
}

export class EventResponseDto
  implements
    Pick<
      IEvent,
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
  @NestedField(CreatorResponseDto, {
    optional: true,
  })
  creator?: CreatorResponseDto;
  @NestedField(LocationResponseDto)
  location: LocationResponseDto;
  @StringField({
    enum: EventType,
  })
  eventType: EventType;
  @NestedField(EventUserStatsResponseDto, {})
  userStats: EventUserStatsResponseDto;
}

export class EventStatsResponseDto implements IEventStats {
  @NumberField()
  likes: number;

  @NumberField()
  ticketsPurchased: number;

  @NumberField()
  wantGo: number;
}

export class SingleEventResponseDto implements IEvent {
  @IdField()
  id: string;
  @StringField()
  slug: string;
  @StringField({
    optional: true,
  })
  link?: string;
  @StringField()
  title: string;
  @StringField({ optional: true })
  picture?: string | undefined;
  @StringField({ optional: true })
  description?: string | undefined;
  @DateField()
  startTime: Date;
  @DateField()
  endTime: Date;
  @NumberField()
  ageLimit: number;

  @StringField({ enum: EventAccessibilityType })
  accessibility: EventAccessibilityType;

  @NestedField(CreatorResponseDto, {
    optional: true,
  })
  creator?: CreatorResponseDto;
  @NestedField(LocationResponseDto)
  location: LocationResponseDto;
  @StringField({
    enum: EventType,
  })
  eventType: EventType;
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
}

export class CreateEventRequestDto {
  @StringField({
    required: true,
    description: 'Stringified json',
    example: JSON.stringify(
      {
        ageLimit: 1,
        description: 'description',
        endTime: new Date('2003-04-01T21:00:00.000Z'),
        startTime: new Date('2003-04-01T21:00:00.000Z'),
        accessibility: EventAccessibilityType.PUBLIC,
        eventType: EventType.USER,
        location: {
          lat: 1,
          lng: 1,
        },
        slug: 'slug',
        tickets: [
          {
            amount: 1,
            description: 'description',
            name: 'name',
            price: 0,
          },
        ],
        title: 'title',
      } as z.infer<typeof CreateEventSchema>,
      null,
      2,
    ),
  })
  rawEvent: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'fileType: image/*; maxSize: 3.5mb',
  })
  photo: Express.Multer.File;
}

export const TicketSchema = z.object({
  name: z.string(),
  price: z.number().max(100000),
  amount: z.number().min(-1).max(1000000).optional().default(-1),
  description: z.string().optional().nullable().default(null),
}); //@todo make startTime and endTime validation

export const CreateEventSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable().default(null),
  slug: z.string(),
  eventType: z.nativeEnum(EventType),
  accessibility: z.nativeEnum(EventAccessibilityType),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  ageLimit: z.number().min(1).max(120),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  tickets: z.array(TicketSchema),
});
