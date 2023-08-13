import { Controller, Get } from '@nestjs/common';

@Controller()
export class JobsServiceController {
  constructor() {}

  @Get('/')
  public health() {
    return {
      ok: true,
      timestamp: new Date(),
    };
  }
}
