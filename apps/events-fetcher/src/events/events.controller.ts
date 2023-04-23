import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { IJwtPayload } from '@app/types/jwt';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
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

  @UseMicroserviceAuthGuard()
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter(req: Request, file) {},
    }),
  )
  public async createEvent(
    @UploadedFile() file: Express.Multer.File,
    @ExtractJwtPayload() jwtPayload: IJwtPayload,
  ) {
    return;
  }
}
