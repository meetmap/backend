import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ParseArrayPipe } from '@nestjs/common';
import { SnapshotDal } from './snapshot.dal';

@Injectable()
export class SnapshotService {
  constructor(private readonly dal: SnapshotDal) {}
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.name,
    routingKey: [
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
    ],
    queue:
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.queues
        .LOCATION_SERVICE,
  })
  public async handleUserSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items: AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto,
      }),
    )
    payload: AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto[],
  ) {
    try {
      console.log('Users sync');
      await this.dal.updateOrCreateUser(payload);
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.name,
    routingKey: [
      RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
    ],
    queue:
      RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.queues
        .LOCATION_SERVICE,
  })
  public async handleUserFromUserServiceSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items: AppDto.TransportDto.Users.UsersServiceUserSnapshotRequestDto,
      }),
    )
    payload: AppDto.TransportDto.Users.UsersServiceUserSnapshotRequestDto[],
  ) {
    try {
      console.log('Users agains users-service sync');
      await this.dal.updateUserAgainstUserService(payload);
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.FRIENDS_SNAPSHOT.name,
    routingKey: [RMQConstants.exchanges.FRIENDS_SNAPSHOT.routingKeys.SYNC],
    queue: RMQConstants.exchanges.FRIENDS_SNAPSHOT.queues.LOCATION_SERVICE,
  })
  public async handleFriendSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items:
          AppDto.TransportDto.Friends.UsersServiceFriendsSnapshotRequestDto,
      }),
    )
    payload: AppDto.TransportDto.Friends.UsersServiceFriendsSnapshotRequestDto[],
  ) {
    try {
      console.log('Friends sync');
      await this.dal.updateOrCreateFriendship(payload);
    } catch (error) {
      console.error(error);
    }
  }
}
