import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import {
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  ///handlers for rmq

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.USERS.routingKeys.USER_CREATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_DELETED,
    ],
    queue: RMQConstants.exchanges.USERS.queues.ASSETS_SERVICE,
  })
  public async handleUser(
    @RabbitPayload() payload: AppDto.TransportDto.Users.UserRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUser.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      if (
        routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_CREATED
      ) {
        await this.usersService.handleCreateUser(payload);
        return;
      }
      if (
        routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED
      ) {
        await this.usersService.handleUpdateUser(payload);
        return;
      }
      if (
        routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED
      ) {
        await this.usersService.handleDeleteUser(payload);
        return;
      } else {
        throw new Error('Invalid routing key');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // @RabbitSubscribe({
  //   exchange: RMQConstants.exchanges.FRIENDS.name,
  //   routingKey: [
  //     RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REQUESTED,
  //     RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED,
  //     RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REJECTED,
  //   ],
  //   queue: RMQConstants.exchanges.FRIENDS.queues.EVENTS_SERVICE,
  // })
  // public async handleFriendship(
  //   @RabbitPayload()
  //   payload: AppDto.TransportDto.Friends.UpdateFriendshipRMQRequestDto,
  //   @RabbitRequest() req: { fields: RequestOptions },
  // ) {
  //   const routingKey = req.fields.routingKey;
  //   console.log({
  //     handler: this.handleFriendship.name,
  //     routingKey: routingKey,
  //     msg: {
  //       userCid: payload.userCId,
  //       friendCid: payload.friendCId,
  //     },
  //   });

  //   try {
  //     if (
  //       routingKey ===
  //       RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REQUESTED
  //     ) {
  //       await this.usersService.handleRequestFriend(
  //         payload.userCId,
  //         payload.friendCId,
  //       );
  //       return;
  //     }
  //     if (
  //       routingKey === RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED
  //     ) {
  //       await this.usersService.handleAddFriend(
  //         payload.userCId,
  //         payload.friendCId,
  //       );
  //       return;
  //     }
  //     if (
  //       routingKey ===
  //       RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REJECTED
  //     ) {
  //       await this.usersService.handleRejectFriend(
  //         payload.userCId,
  //         payload.friendCId,
  //       );
  //       return;
  //     } else {
  //       throw new Error('Invalid routing key');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // //endpoints for user
  // @ApiOkResponse({
  //   type: [AppDto.EventsServiceDto.EventsDto.EventResponseDto],
  // })
  // @Get('/events/liked')
  // @UseMicroserviceAuthGuard()
  // public async getUserLikedEvents(
  //   @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  // ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto[]> {
  //   return this.usersService.getUserLikedEvents(jwt.cid);
  // }

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
