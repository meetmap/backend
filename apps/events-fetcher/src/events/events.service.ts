import { Injectable, NotFoundException } from '@nestjs/common';
import { EventerFetcherService } from '../eventer-fetcher/eventer-fetcher.service';
import { GetEventsByLocationRequestDto } from './dto';
import { EventsDal } from './events.dal';

@Injectable()
export class EventsService {
  constructor(
    private readonly dal: EventsDal,
    private readonly eventerFetcherService: EventerFetcherService,
  ) {}

  public async getEventsByKeywords(keywords: string) {
    return this.dal.getEventsByKeywords(keywords);
  }

  public async getEventBySlug(slug: string) {
    const event = await this.eventerFetcherService.getValidEvent(slug);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  public async getEventsByLocation(dto: GetEventsByLocationRequestDto) {
    const { latitude, longitude, radius } = dto;
    const events = await this.dal.getEventsByLocation(
      longitude,
      latitude,
      radius,
    );

    return events;
  }
}
