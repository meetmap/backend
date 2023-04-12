import { Controller, Get } from '@nestjs/common';
import { MainAppService } from './main-app.service';

@Controller()
export class MainAppController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Get()
  getHello(): string {
    return this.mainAppService.getHello();
  }
}
