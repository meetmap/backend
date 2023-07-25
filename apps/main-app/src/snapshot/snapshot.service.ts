import { RMQConstants } from '@app/constants';
import {
  AuthServiceUserSnapshotRequestDto,
  UsersServiceFriendsSnapshotRequestDto,
  UsersServiceUserSnapshotRequestDto,
} from '@app/dto/rabbit-mq-common';
import { RabbitmqService } from '@app/rabbitmq';
import {
  IFriendsBase,
  IMainAppUser,
  IUsersServiceSnapshotUser,
} from '@app/types';
import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ParseArrayPipe } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SnapshotDal } from './snapshot.dal';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly rmq: RabbitmqService,
    private readonly dal: SnapshotDal,
  ) {}
  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.name,
    routingKey: [
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
    ],
    queue:
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.queues.USER_SERVICE,
  })
  public async handleUserSnapshot(
    @RabbitPayload(
      new ParseArrayPipe({
        items: AuthServiceUserSnapshotRequestDto,
      }),
    )
    payload: AuthServiceUserSnapshotRequestDto[],
  ) {
    console.log('Users sync');
    try {
      await this.dal.updateOrCreateUser(payload);
    } catch (error) {
      console.error(error);
    }
  }

  @Cron('0,30 * * * *')
  public async friendsSnapshotJob() {
    const batchSize = 50;
    console.log('Friends snapshot task started');
    const friendsCursor = this.dal.getAllFriendsCursor(batchSize);
    const friendsBatch: IFriendsBase[] = [];
    let multiplier = 0;
    for await (const friendsDoc of friendsCursor) {
      friendsBatch.push(friendsDoc.toObject());
      if (friendsBatch.length === batchSize) {
        await this.publishFriendsBatch(friendsBatch);
        console.log(
          `${
            multiplier * batchSize + friendsBatch.length
          } friends has been published`,
        );
        friendsBatch.length = 0; // clear the batch array
        multiplier += 1;
      }
    }
    // don't forget the last batch
    if (friendsBatch.length > 0) {
      await this.publishFriendsBatch(friendsBatch);
      console.log(
        `${
          multiplier * batchSize + friendsBatch.length
        } friends has been published`,
      );
    }
    console.log('Friends snapshot task ended');
  }

  @Cron('15,45 * * * *')
  public async usersSnapshotJob() {
    const batchSize = 50;
    console.log('Users snapshot task started');
    const usersCursor = this.dal.getAllUsersCursor(batchSize);
    const usersBatch: IMainAppUser[] = [];
    let multiplier = 0;
    for await (const userDoc of usersCursor) {
      usersBatch.push(userDoc.toObject());
      if (usersBatch.length === batchSize) {
        await this.publishUsersBatch(usersBatch);
        console.log(
          `${
            multiplier * batchSize + usersBatch.length
          } users has been published`,
        );
        usersBatch.length = 0; // clear the batch array
        multiplier += 1;
      }
    }
    // don't forget the last batch
    if (usersBatch.length > 0) {
      await this.publishUsersBatch(usersBatch);
      console.log(
        `${
          multiplier * batchSize + usersBatch.length
        } users has been published`,
      );
    }
    console.log('Users snapshot task ended');
  }

  public async publishUsersBatch(userDocs: IMainAppUser[]) {
    const snapshotBatch = this.getUsersSnapshotBatch(userDocs);
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.name,
      RMQConstants.exchanges.USERS_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
      snapshotBatch,
      //in ms
      { expiration: 60000 },
    );
  }

  public async publishFriendsBatch(friendsDocs: IFriendsBase[]) {
    const snapshotBatch = this.getFriendsSnapshotBatch(friendsDocs);
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.FRIENDS_SNAPSHOT.name,
      RMQConstants.exchanges.FRIENDS_SNAPSHOT.routingKeys.SYNC,
      snapshotBatch,
      //in ms
      { expiration: 60000 },
    );
  }

  private getUsersSnapshotBatch(
    usersDocs: IUsersServiceSnapshotUser[],
  ): UsersServiceUserSnapshotRequestDto[] {
    return usersDocs.map((userDoc) => ({
      cid: userDoc.cid,
      description: userDoc.description,
      name: userDoc.name,
      profilePicture: userDoc.profilePicture,
    }));
  }

  private getFriendsSnapshotBatch(
    friendsDocs: IFriendsBase[],
  ): UsersServiceFriendsSnapshotRequestDto[] {
    return friendsDocs.map((friendsDoc) => ({
      requesterCId: friendsDoc.requesterCId,
      recipientCId: friendsDoc.recipientCId,
      status: friendsDoc.status,
    }));
  }
}
