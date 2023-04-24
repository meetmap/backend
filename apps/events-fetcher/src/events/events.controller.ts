import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { IJwtPayload } from '@app/types/jwt';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CreateEventRequestDto, GetEventsByLocationRequestDto } from './dto';
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
  @UseInterceptors(FileInterceptor('photo'))
  public async createEvent(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 3.5 * 1024 * 1024, //3.5mb
          }),
          new FileTypeValidator({
            fileType: 'image/*',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @ExtractJwtPayload() jwtPayload: IJwtPayload,
    @Body() body: CreateEventRequestDto,
  ) {
    return await this.eventsService.createEvent(
      body.rawEvent,
      jwtPayload.sub,
      file,
    );
  }
}
