export class RMQConstants {
  static get exchanges() {
    return {
      ASSETS: {
        name: 'assets_exchange',
        type: 'direct',
        queues: {
          USER_SERVICE_ASSET_UPLOADED: 'users_service_asset_uploaded_queue',
          LOCATION_SERVICE_ASSET_UPLOADED:
            'location_service_asset_uploaded_queue',
          EVENTS_SERVICE_ASSET_UPLOADED: 'events_service_asset_uploaded_queue',
          ASSETS_SERVICE_ASSET_QUEUE: 'events_service_asset_queue',
        },
        routingKeys: {
          PROFILE_PICTURE_UPDATED: 'profile_picture.updated',
          EVENT_PICTURE_UPDATED: 'event_pitcture.updated',
          ASSET_UPLOAD_FAILED: 'asset_upload.failed',
        },
      },
      FRIENDS_SNAPSHOT: {
        name: 'users_service_friends_snapshot',
        type: 'direct',
        queues: {
          LOCATION_SERVICE: 'location_service__friends_snapshot_queue',
          EVENTS_SERVICE: 'events_service__friends_snapshot_queue',
        },
        routingKeys: {
          SYNC: 'snapshot.sync',
        },
      },
      EVENTS: {
        name: 'events_service_events',
        type: 'direct',
        queues: {
          ASSETS_SERVICE: 'events_service__assets_service_events_queue',
        },
        routingKeys: {
          EVENT_CREATED: 'event.created',
        },
      },
      EVENTS_SERVICE_EVENTS_SNAPSHOT: {
        name: 'events_service_events_snapshot',
        type: 'direct',
        queues: {
          ASSETS_SERVICE:
            'events_service__assets_service_events_snapshot_queue',
        },
        routingKeys: {
          SYNC: 'snapshot.sync',
        },
      },
      USERS_SERVICE_USERS_SNAPSHOT: {
        name: 'users_service_users_snapshot',
        type: 'direct',
        queues: {
          USER_SERVICE: 'users_service__users_service_users_snapshot_queue',
          LOCATION_SERVICE:
            'location_service__users_service_users_snapshot_queue',
          EVENTS_SERVICE: 'events_service__users_service_users_snapshot_queue',
        },
        routingKeys: {
          SYNC: 'snapshot.sync',
        },
      },
      AUTH_SERVICE_USERS_SNAPSHOT: {
        name: 'auth_service_users_snapshot',
        type: 'direct',
        queues: {
          USER_SERVICE: 'users_service__auth_service_users_snapshot_queue',
          LOCATION_SERVICE:
            'location_service__auth_service_users_snapshot_queue',
          EVENTS_SERVICE: 'events_service__auth_service_users_snapshot_queue',
          ASSETS_SERVICE: 'assets_service__auth_service_users_snapshot_queue',
        },
        routingKeys: {
          SYNC: 'snapshot.sync',
        },
      },
      USERS: {
        name: 'user_events',
        type: 'direct',
        queues: {
          USER_SERVICE: 'users_service__user_events_queue',
          LOCATION_SERVICE: 'location_service__user_events_queue',
          EVENTS_SERVICE: 'events_service__user_events_queue',
          ASSETS_SERVICE: 'assets_service__user_events_queue',
        },
        routingKeys: {
          USER_CREATED: 'user.created',
          USER_UPDATED: 'user.updated',
          USER_DELETED: 'user.deleted',
          USER: 'user.#',
        },
      },
      FRIENDS: {
        name: 'friend_events',
        type: 'direct',
        queues: {
          LOCATION_SERVICE: 'location_service__friend_events_queue',
          EVENTS_SERVICE: 'events_service__friend_events_queue',
        },
        routingKeys: {
          FRIEND_REQUESTED: 'friend.requested',
          FRIEND_ADDED: 'friend.added',
          FRIEND_REJECTED: 'friend.rejected',
        },
      },
    } satisfies Record<string, IRMQExchange>;
  }
}

export interface IRMQExchange {
  name: string;
  queues: Record<string, string>;
  routingKeys: Record<string, string>;
  type: 'topic' | 'direct' | 'fanout';
}

// export interface IRMQQueue {
//   name: string;
//   routes: Record<string, string>;
//   // routes:any
// }
