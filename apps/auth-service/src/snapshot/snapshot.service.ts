import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';

import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { Injectable } from '@nestjs/common';
import { SnapshotDal } from './snapshot.dal';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly rmq: RabbitmqService,
    private readonly dal: SnapshotDal,
  ) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey: [
      RMQConstants.exchanges.JOBS.routingKeys
        .AUTH_SERVICE_USER_SNAPSHOT_REQUEST,
    ],
    queue: 'auth-service.snapshot.users',
  })
  public async usersSnapshotJob() {
    const batchSize = 50;
    console.log('Users snapshot task started');
    const usersCursor = this.dal.getAllUsersCursor(batchSize);
    const userBatch: AppTypes.AuthService.Users.ISafeUser[] = [];
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

  private async publishBatch(
    userBatch: Array<AppTypes.Transport.Snapshot.Users.IAuthServiceSnapshot>,
  ) {
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
    userBatch: Array<AppTypes.Transport.Snapshot.Users.IAuthServiceSnapshot>,
  ): AppDto.TransportDto.Users.AuthServiceUserSnapshotRequestDto[] {
    return userBatch.map((user) => ({
      birthDate: user.birthDate,
      cid: user.cid,
      email: user.email,
      username: user.username,
      fbId: user.fbId,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
    }));
  }
}
