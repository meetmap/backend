import { Controller, Get } from '@nestjs/common';

@Controller()
export class EventsFetcherController {
  @Get('/')
  public health() {
    return {
      ok: true,
      timestamp: new Date(),
    };
  }
}
