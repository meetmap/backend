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

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_CREATED],
    queue: 'location-service.users.created',
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
    return;
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.USERS.routingKeys.USER_DELETED,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
    ],
    queue: 'location-service.users.updates',
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
    queue: 'location-service.friends.updates',
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
}
