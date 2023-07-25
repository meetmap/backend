import { RMQConstants } from '@app/constants';
import { AuthServiceUserSnapshotRequestDto } from '@app/dto/rabbit-mq-common';
import { RabbitmqService } from '@app/rabbitmq';
import { IAuthServiceSnapshotUser, ISafeAuthUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SnapshotDal } from './snapshot.dal';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly rmq: RabbitmqService,
    private readonly dal: SnapshotDal,
  ) {}

  @Cron('0,30 * * * *')
  public async usersSnapshotJob() {
    const batchSize = 50;
    console.log('Users snapshot task started');
    const usersCursor = this.dal.getAllUsersCursor(batchSize);
    const userBatch: ISafeAuthUser[] = [];
    let multiplier = 0;
    for await (const userDoc of usersCursor) {
      userBatch.push(userDoc.toObject());
      if (userBatch.length === batchSize) {
        await this.publishBatch(userBatch);
        console.log(
          `${
            multiplier * batchSize + userBatch.length
          } users has been published`,
        );
        userBatch.length = 0; // clear the batch array
        multiplier += 1;
      }
    }
    // don't forget the last batch
    if (userBatch.length > 0) {
      await this.publishBatch(userBatch);
      console.log(
        `${multiplier * batchSize + userBatch.length} users has been published`,
      );
    }
    console.log('Users snapshot task ended');
  }

  private async publishBatch(userBatch: Array<IAuthServiceSnapshotUser>) {
    const snapshotBatch = this.getSnapshotBatch(userBatch);
    await this.rmq.amqp.publish(
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.name,
      RMQConstants.exchanges.AUTH_SERVICE_USERS_SNAPSHOT.routingKeys.SYNC,
      snapshotBatch,
      //in ms
      { expiration: 60000 },
    );
  }

  private getSnapshotBatch(
    userBatch: Array<IAuthServiceSnapshotUser>,
  ): AuthServiceUserSnapshotRequestDto[] {
    return userBatch.map((user) => ({
      birthDate: user.birthDate,
      cid: user.cid,
      email: user.email,
      username: user.username,
      fbId: user.fbId,
      name: user.name,
      phone: user.phone,
    }));
  }
}
