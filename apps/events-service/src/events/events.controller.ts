import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
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
    type: [AppDto.EventsServiceDto.EventsDto.EventResponseDto],
  })
  @Get('/?')
  @UseMicroserviceAuthGuard()
  public async getEventsByKeywords(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Query('q') keywords: string,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto[]> {
    return this.eventsService.getEventsByKeywords(jwt.cid, keywords);
  }

  @ApiOkResponse({
    type: [AppDto.EventsServiceDto.EventsDto.EventResponseDto],
  })
  @UseMicroserviceAuthGuard()
  @Get('/batch')
  public async getEventsBatch(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    eventsIds: string[],
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto[]> {
    return this.eventsService.getEventsBatch(jwt.cid, eventsIds);
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto,
  })
  @Get('/:eventId')
  @UseMicroserviceAuthGuard()
  public async getEventById(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Param('eventId') eventId: string,
  ): Promise<AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto> {
    return this.eventsService.getEventById(jwt.cid, eventId);
  }

  @ApiOkResponse({
    type: [AppDto.EventsServiceDto.EventsDto.MinimalEventByLocationResponseDto],
  })
  @UseMicroserviceAuthGuard()
  @Post('/location')
  public async getEventsByLocation(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Body()
    dto: AppDto.EventsServiceDto.EventsDto.GetEventsByLocationRequestDto,
  ): Promise<
    AppDto.EventsServiceDto.EventsDto.MinimalEventByLocationResponseDto[]
  > {
    return this.eventsService.getEventsByLocation(jwt.cid, dto);
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventResponseDto,
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
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Body() body: AppDto.EventsServiceDto.EventsDto.CreateEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto> {
    return await this.eventsService.userCreateEvent(
      body.rawEvent,
      jwtPayload.cid,
      file,
    );
  }
  //like event
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Patch('/like/:eventId')
  @UseMicroserviceAuthGuard()
  public async likeEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.userAction(
      jwtPayload.cid,
      eventId,
      'like',
    );
    return stats;
  }
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Delete('/like/:eventId')
  @UseMicroserviceAuthGuard()
  public async cancelLikeEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.cancelUserAction(
      jwtPayload.cid,
      eventId,
      'like',
    );
    return stats;
  }

  //will-go
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Patch('/want-go/:eventId')
  @UseMicroserviceAuthGuard()
  public async willGoEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.userAction(
      jwtPayload.cid,
      eventId,
      'want-go',
    );
    return stats;
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Delete('/want-go/:eventId')
  @UseMicroserviceAuthGuard()
  public async cancelWillGoEvent(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.cancelUserAction(
      jwtPayload.cid,
      eventId,
      'want-go',
    );
    return stats;
  }

  @Get('/likes/:eventId')
  @ApiOkResponse({
    type: [AppDto.EventsServiceDto.UsersDto.EventsServiceUserResponseDto],
  })
  @UseMicroserviceAuthGuard()
  public async getEventLikes(
    @Param('eventId') eventId: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.UsersDto.EventsServiceUserResponseDto[]> {
    const usersLiked = await this.eventsService.getEventLikes(eventId);
    return usersLiked;
  }
}
