import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import {
  CreateEventRequestDto,
  EventResponseDto,
  EventStatsResponseDto,
  GetEventsByLocationRequestDto,
  MinimalEventByLocationResponseDto,
  SingleEventResponseDto,
} from '@app/dto/events-service/events.dto';
import { EventsServiceUserResponseDto } from '@app/dto/events-service/users.dto';
import { IJwtUserPayload } from '@app/types/jwt';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseArrayPipe,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @Get('/?')
  @UseMicroserviceAuthGuard()
  public async getEventsByKeywords(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
    @Query('q') keywords: string,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getEventsByKeywords(jwt.cid, keywords);
  }

  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @UseMicroserviceAuthGuard()
  @Get('/batch')
  public async getEventsBatch(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    eventsIds: string[],
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getEventsBatch(jwt.cid, eventsIds);
  }

  @ApiOkResponse({
    type: SingleEventResponseDto,
  })
  @Get('/:eventId')
  @UseMicroserviceAuthGuard()
  public async getEventById(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
    @Param('eventId') eventId: string,
  ): Promise<SingleEventResponseDto> {
    return this.eventsService.getEventById(jwt.cid, eventId);
  }

  @ApiOkResponse({
    type: [MinimalEventByLocationResponseDto],
  })
  @UseMicroserviceAuthGuard()
  @Post('/location')
  public async getEventsByLocation(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
    @Body() dto: GetEventsByLocationRequestDto,
  ): Promise<MinimalEventByLocationResponseDto[]> {
    return this.eventsService.getEventsByLocation(jwt.cid, dto);
  }

  @ApiOkResponse({
    type: EventResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseMicroserviceAuthGuard()
  @Post('/create')
  @UseInterceptors(FileInterceptor('photo'))
  public async createUserEvent(
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
    return await this.eventsService.userCreateEvent(
      body.rawEvent,
      jwtPayload.cid,
      file,
    );
  }
  //like event
  @ApiOkResponse({
    type: EventStatsResponseDto,
  })
  @Patch('/like/:eventId')
  @UseMicroserviceAuthGuard()
  public async likeEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<EventStatsResponseDto> {
    const stats = await this.eventsService.userAction(
      jwtPayload.cid,
      eventId,
      'like',
    );
    return stats;
  }
  @ApiOkResponse({
    type: EventStatsResponseDto,
  })
  @Delete('/like/:eventId')
  @UseMicroserviceAuthGuard()
  public async cancelLikeEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<EventStatsResponseDto> {
    const stats = await this.eventsService.cancelUserAction(
      jwtPayload.cid,
      eventId,
      'like',
    );
    return stats;
  }

  //will-go
  @ApiOkResponse({
    type: EventStatsResponseDto,
  })
  @Patch('/want-go/:eventId')
  @UseMicroserviceAuthGuard()
  public async willGoEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<EventStatsResponseDto> {
    const stats = await this.eventsService.userAction(
      jwtPayload.cid,
      eventId,
      'want-go',
    );
    return stats;
  }

  @ApiOkResponse({
    type: EventStatsResponseDto,
  })
  @Delete('/want-go/:eventId')
  @UseMicroserviceAuthGuard()
  public async cancelWillGoEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<EventStatsResponseDto> {
    const stats = await this.eventsService.cancelUserAction(
      jwtPayload.cid,
      eventId,
      'want-go',
    );
    return stats;
  }

  @Get('/likes/:eventId')
  @ApiOkResponse({
    type: [EventsServiceUserResponseDto],
  })
  @UseMicroserviceAuthGuard()
  public async getEventLikes(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<EventsServiceUserResponseDto[]> {
    const usersLiked = await this.eventsService.getEventLikes(eventId);
    return usersLiked;
  }
}
