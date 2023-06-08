import {
  EventType,
  ICity,
  IEvent,
  ILocation,
  IPoint,
  IPrice,
  ITicket,
} from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { PopulatedDoc, Types } from 'mongoose';
import { z } from 'zod';
import { DateField, IdField, NumberField, StringField } from '../decorators';

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

export class PointDto implements IPoint {
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

export class LocationDto implements ILocation {
  @StringField()
  country: string;
  @IdField({ optional: true })
  cityId?: PopulatedDoc<ICity, Types.ObjectId | undefined>;
  @ApiProperty({
    type: PointDto,
  })
  coordinates: PointDto;
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
  @ApiProperty({
    type: PriceDto,
  })
  price: IPrice;
  @NumberField({
    min: -1,
    description: `-1 means Infinity; 0 means OOS; `,
  })
  amount: number;
}

export class EventResponseDto implements IEvent {
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
  @IdField({ optional: true })
  creatorId?: string | undefined;
  @ApiProperty({
    type: LocationDto,
  })
  location: LocationDto;
  @StringField({
    enum: EventType,
  })
  eventType: EventType;
  @ApiProperty({
    type: [TicketDto],
  })
  tickets: ITicket[];
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
        ageLimit: 0,
        description: 'description',
        endTime: new Date('2003-04-01T21:00:00.000Z'),
        startTime: new Date('2003-04-01T21:00:00.000Z'),
        eventType: 'USER_PRIVATE',
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
      } satisfies z.infer<typeof CreateEventSchema>,
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
  file: Express.Multer.File;
}

export const TicketSchema = z.object({
  name: z.string(),
  price: z.number().max(100000),
  amount: z.number().min(-1).max(1000000).optional().default(-1),
  description: z.string().optional().nullable().default(null),
});
//@todo make startTime and endTime validation
export const CreateEventSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable().default(null),
  slug: z.string(),
  eventType: z.enum(['USER_PUBLIC', 'USER_PRIVATE']),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  ageLimit: z.number().min(1).max(120),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  tickets: z.array(TicketSchema),
});
