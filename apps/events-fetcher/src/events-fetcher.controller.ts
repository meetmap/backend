import { Controller, Get } from '@nestjs/common';
import { EventsFetcherService } from './events-fetcher.service';

@Controller()
export class EventsFetcherController {
  constructor(private readonly eventsFetcherService: EventsFetcherService) {}

  @Get()
  getHello() {
    // return this.eventsFetcherService.getHello();
  }
}
