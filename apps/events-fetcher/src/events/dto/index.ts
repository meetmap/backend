import { z } from 'zod';
import { IsNumber, IsString, Max, Min } from 'class-validator';
import { EventType } from '@app/types';

// export class CreateEventRequestDto {
//   @IsString()
//   rawEvent: string;
// }

// const eventType = ["PARTNER_EVENT","USER_PRIVATE",'USER_PUBLIC'] as( keyof typeof EventType)[]

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
