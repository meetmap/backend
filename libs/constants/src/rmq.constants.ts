export class RMQConstants {
  static get exchanges() {
    return {
      JOBS: {
        name: 'jobs_exchange',
        type: 'direct',
        routingKeys: {
          AUTH_SERVICE_USER_SNAPSHOT_REQUEST:
            'auth-service.snapshot.users.request',
          USERS_SERVICE_USER_SNAPSHOT_REQUEST:
            'user-service.snapshot.users.request',
          USERS_SERVICE_FRIENDS_SNAPSHOT_REQUEST:
            'user-service.snapshot.friends.request',
          EVENTS_SERVICE_EVENTS_SNAPSHOT_REQUEST:
            'events-service.snapshot.events.request',
          EVENTS_SERVICE_TAGS_SYNC_REQUEST: 'events-service.sync.tags.request',
          EVENTS_SERVICE_EVENTER_CO_IL_SYNC_REQUEST:
            'events-service.sync.eventer_co_il.request',
          EVENTS_SERVICE_YANDEX_AFISHA_SYNC_REQUEST:
            'events-service.sync.yandex_afisha.request',
          EVENTS_SERVICE_YANDEX_AFISHA_SYNC_CITY_REQUEST:
            'events-service.sync.yandex_afisha.city.request',
          EVENTS_SERVICE_EVENTS_PROCESSING_REQUEST:
            'events-service.processing.events.request',
          EVENTS_SERVICE_EVENTS_SEARCH_WARMING_REQUEST:
            'events-service.search-warming.events.request',
        },
      },
      ASSETS: {
        name: 'assets_exchange',
        type: 'direct',
        routingKeys: {
          PROFILE_PICTURE_UPDATED: 'assets-service.profile_picture.updated',
          EVENT_PICTURE_UPDATED: 'assets-service.event_pitcture.updated',
          ASSET_UPLOAD_FAILED: 'assets-service.asset_upload.failed',
        },
      },
      FRIENDS_SNAPSHOT: {
        name: 'users_service_friends_snapshot',
        type: 'direct',
        routingKeys: {
          SYNC: 'users-service.snapshot.friends.sync',
        },
      },
      EVENTS: {
        name: 'events_service_events',
        type: 'direct',

        routingKeys: {
          EVENT_CREATED: 'events-service.event.created',
          EVENT_UPDATED: 'events-service.event.updated',
          EVENT_DELETED: 'events-service.event.deleted',
          ASSIGN_TAGS: 'events-service.event.assign-tags',
          EVENT_PROCESSING_PENDING: 'events-service.event.processing.pending',
          EVENT_PROCESSING_SUCCEED: 'events-service.event.processing.succeed',
          EVENT_PROCESSING_FAILED: 'events-service.event.processing.failed',
        },
      },
      EVENTS_SERVICE_EVENTS_SNAPSHOT: {
        name: 'events_service_events_snapshot',
        type: 'direct',

        routingKeys: {
          SYNC: 'events_service.snapshot.events.sync',
        },
      },
      USERS_SERVICE_USERS_SNAPSHOT: {
        name: 'users_service_users_snapshot',
        type: 'direct',

        routingKeys: {
          SYNC: 'users-service.snapshot.users.sync',
        },
      },
      AUTH_SERVICE_USERS_SNAPSHOT: {
        name: 'auth_service_users_snapshot',
        type: 'direct',
        routingKeys: {
          SYNC: 'auth-service.snapshot.users.sync',
        },
      },
      USERS: {
        name: 'user_events',
        type: 'direct',
        routingKeys: {
          USER_CREATED: 'user.created',
          USER_UPDATED: 'user.updated',
          USER_DELETED: 'user.deleted',
          USER_ALL: 'user.#',
        },
      },
      FRIENDS: {
        name: 'friend_events',
        type: 'direct',
        routingKeys: {
          FRIEND_REQUESTED: 'users-service.friend.requested',
          FRIEND_ADDED: 'users-service.friend.added',
          FRIEND_REJECTED: 'users-service.friend.rejected',
        },
      },
    } satisfies Record<string, IRMQExchange>;
  }
}

export interface IRMQExchange {
  name: string;
  routingKeys: Record<string, string>;
  type: 'topic' | 'direct' | 'fanout';
}

// export interface IRMQQueue {
//   name: string;
//   routes: Record<string, string>;
//   // routes:any
// }
