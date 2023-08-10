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
    queue: 'assets-service.snapshot.auth-users-handler',
  })
  public async handleUserSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items: AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto,
      }),
    )
    payload: AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto[],
  ) {
    console.log('Users sync');
    try {
      await this.dal.updateOrCreateUser(payload);
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.EVENTS_SERVICE_EVENTS_SNAPSHOT.name,
    routingKey: [
      RMQConstants.exchanges.EVENTS_SERVICE_EVENTS_SNAPSHOT.routingKeys.SYNC,
    ],
    queue: 'assets-service.snapshot.events-handler',
  })
  public async handleEventsSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items: AppDto.TransportDto.Events.EventsServiceEventSnapshotRequestDto,
      }),
    )
    payload: AppDto.TransportDto.Events.EventsServiceEventSnapshotRequestDto[],
  ) {
    console.log('Events sync');
    try {
      await this.dal.updateOrCreateEvent(payload);
    } catch (error) {
      console.error(error);
    }
  }
}
