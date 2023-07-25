import { RMQConstants } from '@app/constants';
import {
  AuthServiceUserSnapshotRequestDto,
  UsersServiceFriendsSnapshotRequestDto,
} from '@app/dto/rabbit-mq-common';
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
        items: AuthServiceUserSnapshotRequestDto,
      }),
    )
    payload: AuthServiceUserSnapshotRequestDto[],
  ) {
    try {
      console.log('Users sync');
      await this.dal.updateOrCreateUser(payload);
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
        items: UsersServiceFriendsSnapshotRequestDto,
      }),
    )
    payload: UsersServiceFriendsSnapshotRequestDto[],
  ) {
    try {
      console.log('Friends sync');
      await this.dal.updateOrCreateFriendship(payload);
    } catch (error) {
      console.error(error);
    }
  }
}
