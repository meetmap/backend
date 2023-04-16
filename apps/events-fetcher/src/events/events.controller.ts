import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetEventsByLocationRequestDto } from './dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('/?')
  public async getEventsByKeywords(@Query('q') keywords: string) {
    return this.eventsService.getEventsByKeywords(keywords);
  }

  // @Get('/:slug')
  // public async getEventBySlug(@Param('slug') slug: string) {
  //   return this.eventsService.getEventBySlug(slug);
  // }

  @Get('/:eventId')
  public async getEventById(@Param('eventId') eventId: string) {
    return this.eventsService.getEventById(eventId);
  }

  @Post('/location')
  public async getEventsByLocation(@Body() dto: GetEventsByLocationRequestDto) {
    return this.eventsService.getEventsByLocation(dto);
  }
}
