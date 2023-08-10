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
    routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED],
    queue: 'assets_service.users.update-handler',
  })
  public async handleUpdateUser(
    @RabbitPayload()
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleUpdateUser.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      await this.usersService.handleUpdateUser(payload);
      return;
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_CREATED],
    queue: 'assets_service.users.create-handler',
  })
  public async handleCreateUser(
    @RabbitPayload()
    payload: AppDto.TransportDto.Users.UserCreatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleCreateUser.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      await this.usersService.handleCreateUser(payload);
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS.name,
    routingKey: [RMQConstants.exchanges.USERS.routingKeys.USER_DELETED],
    queue: 'assets_service.users.delete-handler',
  })
  public async handleDeleteUser(
    @RabbitPayload()
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
    @RabbitRequest() req: { fields: RequestOptions },
  ) {
    const routingKey = req.fields.routingKey;
    console.log({
      handler: this.handleDeleteUser.name,
      routingKey: routingKey,
      msg: {
        cid: payload.cid,
      },
    });
    try {
      await this.usersService.handleDeleteUser(payload.cid);
    } catch (error) {
      console.error(error);
    }
  }
}
