import { Controller, Get } from '@nestjs/common';

@Controller()
export class LocationServiceController {
  @Get('/')
  public health() {
    return {
      ok: true,
      timestamp: new Date(),
    };
  }
}
