import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.ASSETS.name,
    routingKey: [
      RMQConstants.exchanges.ASSETS.routingKeys.EVENT_PICTURE_UPDATED,
    ],
    queue: 'events-service.events.assets.updated',
    // queue: RMQConstants.exchanges.ASSETS.queues.EVENTS_SERVICE_ASSET_UPLOADED,
  })
  public async handleEventAssetsUpdated(
    @RabbitPayload()
    payload: AppDto.TransportDto.Assets.EventPicturesUpdatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;

    console.log({
      handler: this.handleEventAssetsUpdated.name,
      routingKey: routingKey,
      msg: {
        eventCid: payload.eventCid,
      },
    });
    try {
      if (
        routingKey ===
        RMQConstants.exchanges.ASSETS.routingKeys.EVENT_PICTURE_UPDATED
      ) {
        await this.eventsService.updateEventsPicture(
          payload.eventCid,
          payload.assetKeys,
        );
        return;
      } else {
        throw new Error('Invalid routing key');
      }
    } catch (error) {
      console.error(error);
    }
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto,
  })
  @Get('/?')
  @UseMicroserviceAuthGuard()
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async getEventsByKeywords(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Query('q') keywords: string,
    @Query('page') page: number,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto> {
    return this.eventsService.getEventsByKeywords(jwt.cid, keywords, page);
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto
      .EventTagWithMetadataPaginatedResponseDto,
    description: 'Returns all tags sorted by popularity',
  })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @Get('/tags/?')
  @UseMicroserviceAuthGuard()
  public async searchTags(
    @Query('q') query: string,
    @Query('page') page: number,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventTagWithMetadataPaginatedResponseDto> {
    if (!query) {
      return await this.eventsService.getAllTags(page);
    }
    return await this.eventsService.searchTags(query, page);
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto,
  })
  @UseMicroserviceAuthGuard()
  @Get('/batch')
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async getEventsBatch(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Query('page') page: number,
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    eventsIds: string[],
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto> {
    return this.eventsService.getEventsBatch(jwt.cid, eventsIds, page);
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto,
  })
  @Get('/:eventCid')
  @UseMicroserviceAuthGuard()
  public async getEventById(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Param('eventCid') eventCid: string,
  ): Promise<AppDto.EventsServiceDto.EventsDto.SingleEventResponseDto> {
    return this.eventsService.getEventByCid(jwt.cid, eventCid);
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
  @UseMicroserviceAuthGuard()
  @Post('/create')
  public async createUserEvent(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Body()
    payload: AppDto.EventsServiceDto.EventsDto.CreateUserEventRequestDto,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto> {
    return await this.eventsService.createUserEvent(jwtPayload.cid, payload);
  }
  //like event
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Patch('/like/:eventCid')
  @UseMicroserviceAuthGuard()
  public async likeEvent(
    @Param('eventCid') eventCid: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.userAction(
      jwtPayload.cid,
      eventCid,
      'like',
    );
    return stats;
  }
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Delete('/like/:eventCid')
  @UseMicroserviceAuthGuard()
  public async cancelLikeEvent(
    @Param('eventCid') eventCid: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.cancelUserAction(
      jwtPayload.cid,
      eventCid,
      'like',
    );
    return stats;
  }

  //will-go
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Patch('/want-go/:eventCid')
  @UseMicroserviceAuthGuard()
  public async willGoEvent(
    @Param('eventCid') eventCid: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.userAction(
      jwtPayload.cid,
      eventCid,
      'want-go',
    );
    return stats;
  }

  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto,
  })
  @Delete('/want-go/:eventCid')
  @UseMicroserviceAuthGuard()
  public async cancelWillGoEvent(
    @Param('eventCid') eventCid: string,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventStatsResponseDto> {
    const stats = await this.eventsService.cancelUserAction(
      jwtPayload.cid,
      eventCid,
      'want-go',
    );
    return stats;
  }

  @Get('/likes/:eventCid')
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.UsersDto.UserPaginatedResponseDto,
  })
  @UseMicroserviceAuthGuard()
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async getEventLikes(
    @Param('eventCid') eventCid: string,
    @Query('page') page: number,
  ): Promise<AppDto.EventsServiceDto.UsersDto.UserPaginatedResponseDto> {
    const usersLiked = await this.eventsService.getEventLikes(eventCid, page);
    return usersLiked;
  }
}
