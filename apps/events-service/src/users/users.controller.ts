import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { ParsePagePipe } from '@app/dto/pipes';
import { AppTypes } from '@app/types';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_CREATED],
    queue: 'events-service.users.created',
  })
  public async handleUserCreated(
    @RabbitPayload()
    payload: AppDto.TransportDto.Users.UserCreatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUserCreated.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    await this.usersService.handleCreateUser(payload);
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_DELETED,
    ],
    queue: 'events-service.users.updated',
  })
  public async handleUserUpdated(
    @RabbitPayload()
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUserUpdated.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED) {
      await this.usersService.handleUpdateUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED) {
      await this.usersService.handleDeleteUser(payload);
      return;
    } else {
      throw new Error('Invalid routing key');
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.FRIENDS.name,
    routingKey: [
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REQUESTED,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REJECTED,
    ],
    queue: 'events-service.friends.updates',
  })
  public async handleFriendship(
    @RabbitPayload()
    payload: AppDto.TransportDto.Friends.UpdateFriendshipRMQRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleFriendship.name,
      routingKey: routingKey,
      msg: {
        userCid: payload.userCId,
        friendCid: payload.friendCId,
      },
    });

    try {
      if (
        routingKey ===
        RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REQUESTED
      ) {
        await this.usersService.handleRequestFriend(
          payload.userCId,
          payload.friendCId,
        );
        return;
      }
      if (
        routingKey === RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED
      ) {
        await this.usersService.handleAddFriend(
          payload.userCId,
          payload.friendCId,
        );
        return;
      }
      if (
        routingKey ===
        RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REJECTED
      ) {
        await this.usersService.handleRejectFriend(
          payload.userCId,
          payload.friendCId,
        );
        return;
      } else {
        throw new Error('Invalid routing key');
      }
    } catch (error) {
      console.error(error);
    }
  }

  //endpoints for user
  @ApiOkResponse({
    type: AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @Get('/events/liked/?')
  @UseMicroserviceAuthGuard()
  public async getUserLikedEvents(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
    @Query('page', new ParsePagePipe()) page: number,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto> {
    return this.usersService.getUserLikedEvents(jwt.cid, page);
  }

  // @ApiOkResponse({
  //   type: [EventResponseDto],
  // })
  // @Get('/events/saved')
  // @UseMicroserviceAuthGuard()
  // public async getUserSavedEvents(
  //   @ExtractJwtPayload() jwt: IJwtUserPayload,
  // ): Promise<EventResponseDto[]> {
  //   return this.usersService.getUserSavedEvents(jwt.cid);
  // }

  // @ApiOkResponse({
  //   type: [EventResponseDto],
  // })
  // @Get('/events/will-go')
  // @UseMicroserviceAuthGuard()
  // public async getUserWillGoEvents(
  //   @ExtractJwtPayload() jwt: IJwtUserPayload,
  // ): Promise<EventResponseDto[]> {
  //   return this.usersService.getUserWillGoEvents(jwt.cid);
  // }
}
