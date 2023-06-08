import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import {
  CreateEventRequestDto,
  EventResponseDto,
  GetEventsByLocationRequestDto,
} from '@app/dto/events-fetcher/events.dto';
import { IJwtUserPayload } from '@app/types/jwt';
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
import { ApiBody, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @Get('/?')
  public async getEventsByKeywords(
    @Query('q') keywords: string,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getEventsByKeywords(keywords);
  }

  // @Get('/:slug')
  // public async getEventBySlug(@Param('slug') slug: string) {
  //   return this.eventsService.getEventBySlug(slug);
  // }
  @ApiOkResponse({
    type: EventResponseDto,
  })
  @Get('/:eventId')
  public async getEventById(
    @Param('eventId') eventId: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.getEventById(eventId);
  }

  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @Post('/location')
  public async getEventsByLocation(
    @Body() dto: GetEventsByLocationRequestDto,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getEventsByLocation(dto);
  }

  @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       rawEvent: { type: 'string' },
  //       photo: {
  //         type: 'string',
  //         description: "fileType: 'image/*'; maxSize: 3.5mb",
  //         // format: 'binary',
  //         format: 'binary',
  //         pattern: 'image/*',
  //       },
  //     },
  //   },
  // })
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
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
    @Body() body: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    return await this.eventsService.createEvent(
      body.rawEvent,
      jwtPayload.sub,
      file,
    );
  }
}
