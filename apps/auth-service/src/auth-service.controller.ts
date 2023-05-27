import { Controller, Get } from '@nestjs/common';

@Controller()
export class AuthServiceController {
  constructor() {}

  @Get('/')
  public health() {
    return {
      ok: true,
      timestamp: new Date(),
    };
  }
}
