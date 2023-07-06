import { RMQConstants } from '@app/constants';
import { UpdateFriendshipRMQRequestDto } from '@app/dto/main-app/friends.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common/users.dto';
import {
  Nack,
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
    routingKey: [
      RMQConstants.exchanges.USERS.routingKeys.USER_CREATED,
      RMQConstants.exchanges.USERS.routingKeys.USER_DELETED,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
    ],
    queue: RMQConstants.exchanges.USERS.queues.LOCATION_SERVICE,
  })
  public async handleUser(
    @RabbitPayload() payload: UserRmqRequestDto,
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

    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_CREATED) {
      await this.usersService.handleCreateUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED) {
      await this.usersService.handleUpdateUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED) {
      await this.usersService.handleDeleteUser(payload);
      return;
    } else {
      return new Nack(true);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED,
      RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REMOVED,
    ],
    queue: RMQConstants.exchanges.USERS.queues.LOCATION_SERVICE,
  })
  public async handleFriendship(
    @RabbitPayload() payload: UpdateFriendshipRMQRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleFriendship.name,
      routingKey: routingKey,
      msg: {
        userCid: payload.userCid,
        friendCid: payload.friendCid,
      },
    });

    if (
      routingKey === RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_ADDED
    ) {
      await this.usersService.handleAddFriend(
        payload.userCid,
        payload.friendCid,
      );
      return;
    }
    if (
      routingKey === RMQConstants.exchanges.FRIENDS.routingKeys.FRIEND_REMOVED
    ) {
      await this.usersService.handleRemoveFriend(
        payload.userCid,
        payload.friendCid,
      );
      return;
    } else {
      return new Nack(true);
    }
  }
}
