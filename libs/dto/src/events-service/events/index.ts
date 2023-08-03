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

export class EventUserStatsResponseDto
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

export class PointResponseDto implements AppTypes.Shared.Location.IPoint {
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
  implements Omit<AppTypes.Shared.Location.ILocation, 'cityId'>
{
  @StringField()
  country: string;
  @StringField({ optional: true })
  city?: string;
  @NestedField(PointResponseDto)
  coordinates: PointResponseDto;
}

export class PriceDto implements AppTypes.EventsService.Event.IPrice {
  @StringField()
  currency: string;
  @NumberField()
  amount: number;
}

export class TicketDto implements AppTypes.EventsService.Event.ITicket {
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
  implements AppTypes.EventsService.Event.ICreator
{
  type: AppTypes.EventsService.Event.CreatorType;
  creatorCid: string;
}

export class MinimalEventByLocationResponseDto
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
}

export class EventStatsResponseDto
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
  implements AppTypes.EventsService.Event.IEvent
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
}

class CreateUserEventLocationRequestDto {
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

class CreateUserEventTicketRequestDto {
  @StringField()
  name: string;
  @NumberField({ max: 100000 })
  price: number;
  @NumberField({ max: 1000000, min: -1 })
  amount: number;
  @StringField({ optional: true })
  description?: string;
}

export class CreateUserEventRequestDto {
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
}

// export class CreateEventRequestDto {
//   @StringField({
//     required: true,
//     description: 'Stringified json',
//     example: JSON.stringify(
//       {
//         ageLimit: 1,
//         description: 'description',
//         endTime: new Date('2003-04-01T21:00:00.000Z'),
//         startTime: new Date('2003-04-01T21:00:00.000Z'),
//         accessibility:
//           AppTypes.EventsService.Event.EventAccessibilityType.PUBLIC,
//         eventType: AppTypes.EventsService.Event.EventType.USER,
//         location: {
//           lat: 1,
//           lng: 1,
//         },
//         slug: 'slug',
//         tickets: [
//           {
//             amount: 1,
//             description: 'description',
//             name: 'name',
//             price: 0,
//           },
//         ],
//         title: 'title',
//       } as z.infer<typeof CreateEventSchema>,
//       null,
//       2,
//     ),
//   })
//   rawEvent: string;

//   @ApiProperty({
//     type: 'string',
//     format: 'binary',
//     required: true,
//     description: 'fileType: image/*; maxSize: 3.5mb',
//   })
//   photo: Express.Multer.File;
// }

// export const TicketSchema = z.object({
//   name: z.string(),
//   price: z.number().max(100000),
//   amount: z.number().min(-1).max(1000000).optional().default(-1),
//   description: z.string().optional().nullable().default(null),
// }); //@todo make startTime and endTime validation

// export const CreateEventSchema = z.object({
//   title: z.string(),
//   description: z.string().optional().nullable().default(null),
//   slug: z.string(),
//   eventType: z.nativeEnum(AppTypes.EventsService.Event.EventType),
//   accessibility: z.nativeEnum(
//     AppTypes.EventsService.Event.EventAccessibilityType,
//   ),
//   startTime: z.coerce.date(),
//   endTime: z.coerce.date(),
//   ageLimit: z.number().min(1).max(120),
//   location: z.object({
//     lat: z.number(),
//     lng: z.number(),
//   }),
//   tickets: z.array(TicketSchema),
// });
