import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { RMQConstants } from '@app/constants';
import { EventResponseDto } from '@app/dto/events-fetcher/events.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common/users.dto';
import { IJwtUserPayload } from '@app/types/jwt';
import {
  Nack,
  RabbitPayload,
  RabbitRequest,
  RabbitSubscribe,
  RequestOptions,
} from '@golevelup/nestjs-rabbitmq';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
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
    queue: RMQConstants.exchanges.USERS.queues.EVENTS_SERVICE,
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
      await this.usersService.createUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED) {
      await this.usersService.updateUser(payload);
      return;
    }
    if (routingKey === RMQConstants.exchanges.USERS.routingKeys.USER_DELETED) {
      await this.usersService.deleteUser(payload.cid);
      return;
    } else {
      return new Nack(true);
    }
  }

  //endpoints for user
  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @Get('/events/liked')
  @UseMicroserviceAuthGuard()
  public async getUserLikedEvents(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<EventResponseDto[]> {
    return this.usersService.getUserLikedEvents(jwt.cid);
  }

  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @Get('/events/saved')
  @UseMicroserviceAuthGuard()
  public async getUserSavedEvents(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<EventResponseDto[]> {
    return this.usersService.getUserSavedEvents(jwt.cid);
  }

  @ApiOkResponse({
    type: [EventResponseDto],
  })
  @Get('/events/will-go')
  @UseMicroserviceAuthGuard()
  public async getUserWillGoEvents(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<EventResponseDto[]> {
    return this.usersService.getUserWillGoEvents(jwt.cid);
  }
}
