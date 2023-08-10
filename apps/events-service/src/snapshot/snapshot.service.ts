import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';

import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ParseArrayPipe } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SnapshotDal } from './snapshot.dal';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly dal: SnapshotDal,
    private readonly rmq: RabbitmqService,
  ) {}
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.name,
    routingKey: [
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
    ],
    queue: 'events-service.snapshot.auth-service-users',
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
    exchange: RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.name,
    routingKey: [
      RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
    ],
    queue: 'events-service.snapshot.users-service-users',
  })
  public async handleUserFromUserServiceSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items: AppDto.TransportDto.Users.UsersServiceUserSnapshotRequestDto,
      }),
    )
    payload: AppDto.TransportDto.Users.UsersServiceUserSnapshotRequestDto[],
  ) {
    console.log('Users agains users service sync');
    try {
      await this.dal.updateUserAgainstUserService(payload);
    } catch (error) {
      console.error(error);
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.FRIENDS_SNAPSHOT.name,
    routingKey: [RMQConstants.exchanges.FRIENDS_SNAPSHOT.routingKeys.SYNC],
    queue: 'events-service.snapshot.friends',
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

  @Cron('0,30 * * * *')
  public async eventsSnapshotJob() {
    const batchSize = 50;
    console.log('Events snapshot task started');
    const eventsCursor = this.dal.getAllEventsCursor(batchSize);
    const eventsBatch: AppTypes.Transport.Snapshot.Events.IEventsServiceSnapshotEvent[] =
      [];
    let multiplier = 0;
    for await (const userDoc of eventsCursor) {
      eventsBatch.push(userDoc.toObject());
      if (eventsBatch.length === batchSize) {
        await this.publishBatch(eventsBatch);
        console.log(
          `${
            multiplier * batchSize + eventsBatch.length
          } events has been published`,
        );
        eventsBatch.length = 0; // clear the batch array
        multiplier += 1;
      }
    }
    // don't forget the last batch
    if (eventsBatch.length > 0) {
      await this.publishBatch(eventsBatch);
      console.log(
        `${
          multiplier * batchSize + eventsBatch.length
        } events has been published`,
      );
    }
    console.log('Events snapshot task ended');
  }

  private async publishBatch(
    eventsBatch: Array<AppTypes.Transport.Snapshot.Events.IEventsServiceSnapshotEvent>,
  ) {
    const snapshotBatch = this.getSnapshotBatch(eventsBatch);
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.EVENTS_SERVICE_EVENTS_SNAPSHOT.name,
      RMQConstants.exchanges.EVENTS_SERVICE_EVENTS_SNAPSHOT.routingKeys.SYNC,
      snapshotBatch,
      //in ms
      { expiration: 60000 },
    );
  }

  private getSnapshotBatch(
    eventsBatch: Array<AppTypes.Transport.Snapshot.Events.IEventsServiceSnapshotEvent>,
  ): AppDto.TransportDto.Events.EventsServiceEventSnapshotRequestDto[] {
    return eventsBatch.map((event) =>
      AppDto.TransportDto.Events.EventsServiceEventSnapshotRequestDto.create({
        cid: event.cid,
        creator: event.creator
          ? {
              creatorCid: event.creator.creatorCid,
              type: event.creator.type,
            }
          : undefined,
      }),
    );
  }
}
