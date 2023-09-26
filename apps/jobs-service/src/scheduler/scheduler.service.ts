import { RMQConstants } from '@app/constants';
import { RabbitmqService } from '@app/rabbitmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Options } from 'amqplib';

const defaultRequestOptions: Options.Publish = {
  expiration: 60000,
};

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(private readonly rmqService: RabbitmqService) {}
  onModuleInit() {
    this.requestEventsServiceEventerCoIlSyncJob();
  }
  @Cron('0,30 * * * *')
  public async requestAuthServiceUsersSnapshotJob() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .AUTH_SERVICE_USER_SNAPSHOT_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('15,45 * * * *')
  public async requestUsersServiceUsersSnapshotJob() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .USERS_SERVICE_USER_SNAPSHOT_REQUEST,
      {},
      defaultRequestOptions,
    );
  }
  @Cron('0,30 * * * *')
  public async requestUsersServiceFriendsSnapshotJob() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .USERS_SERVICE_USER_SNAPSHOT_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('0,30 * * * *')
  public async requestEventsServiceEventsSnapshotJob() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTS_SNAPSHOT_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('0 0 * * *')
  public async requestEventsServiceEventsProcessingJob() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTS_PROCESSING_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('0,30 * * * *')
  public async requestEventsServiceEventerCoIlSyncJob() {
    console.log('Eventer co il job');
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTER_CO_IL_SYNC_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('3,33 * * * *')
  public async requestEventsServiceSyncTagsMetadataRequest() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys.EVENTS_SERVICE_TAGS_SYNC_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('8,38 * * * *')
  public async requestEventsServiceEventsSearchWarmingRequest() {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTS_SEARCH_WARMING_REQUEST,
      {},
      defaultRequestOptions,
    );
  }

  @Cron('0 0 * * *')
  public async requestEventsServiceYandexAfishaSyncJob() {
    console.log('Yandex Afisha job');
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.JOBS.name,
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_YANDEX_AFISHA_SYNC_REQUEST,
      {},
      defaultRequestOptions,
    );
  }
}
