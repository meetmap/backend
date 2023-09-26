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
          UPLOAD_STARTED: 'service.assets.upload.started',
          UPLOAD_SUCEEED: 'service.assets.upload.succeed',
          UPLOAD_FAILED: 'service.assets.upload.failed',
          POST_PROCESSING_STARTED:
            'service.assets-serverless.post-processing.started',
          POST_PROCESSING_SUCCEED:
            'service.assets-serverless.post-processing.succeed',
          POST_PROCESSING_FAILED:
            'service.assets-serverless.post-processing.failed',
        },
      },
      FRIENDS_SNAPSHOT: {
        name: 'users_service_friends_snapshot',
        type: 'direct',
        routingKeys: {
          SYNC: 'users-service.snapshot.friends.sync',
        },
      },
      EVENT_PROCESSING_DEAD: {
        name: 'events-service.event.processing.dead',
        type: 'direct',
        routingKeys: {
          EVENT_PROCESSING_ALL: 'events-service.event.processing.#',
        },
      },
      EVENT_PROCESSING: {
        name: 'events-service.event.processing',
        type: 'direct',
        routingKeys: {
          //internal usage
          EVENT_PROCESSING_CREATE_REQUESTED:
            'events-service.event.processing.creation-requested',
          EVENT_PROCESSING_UPDATE_REQUESTED:
            'events-service.event.processing.update-requested',
          //public flow usage
          EVENT_PROCESSING_CREATE_INITIALIZED:
            'events-service.event.processing.creation-initialized',
          EVENT_PROCESSING_UPDATE_INITIALIZED:
            'events-service.event.processing.update-initialized',
          EVENT_PROCESSING_EVENT_CREATED:
            'events-service.event.processing.event-created',
          EVENT_PROCESSING_EVENT_UPDATED:
            'events-service.event.processing.event-updated',
          EVENT_PROCESSING_MODERATED:
            'events-service.event.processing.moderated',
          EVENT_PROCESSING_TAGS_ASSIGNED:
            'events-service.event.processing.tags-assigned',
          EVENT_PROCESSING_SUCCEEDED:
            'events-service.event.processing.succeeded',
          EVENT_PROCESSING_FAILED:
            'events-service.event.processing.any-step.failed',
          EVENT_CHANGED_OR_CREATED:
            'events-service.event.processing.changed-or-created',
          //other
          EVENT_PROCESSING_ASSIGN_TAGS_ONLY:
            'events-service.event.processing.assign-tags-only',
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
