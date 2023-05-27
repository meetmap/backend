import { Controller, Get } from '@nestjs/common';

@Controller()
export class MainAppController {
  @Get('/')
  public health() {
    return {
      ok: true,
      timestamp: new Date(),
    };
  }
}
