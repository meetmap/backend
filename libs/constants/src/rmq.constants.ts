export class RMQConstants {
  static get exchanges() {
    return {
      LOCATION: {
        name: 'location_events',
        type: 'direct',
        queues: {
          LOCATION: {
            name: 'location_service_queue',
            routes: {},
          },
        },
      },
      USERS: {
        name: 'user_events',
        type: 'direct',
        queues: {
          USER_SERVICE: {
            name: 'users_service_queue',
            routes: {
              USER_CREATED: 'user.created',
              USER_UPDATED: 'user.updated',
              USER_DELETED: 'user.deleted',
              USER: 'user.#',
            },
          },
        },
      },
    } satisfies Record<string, IRMQExchange>;
  }
}

export interface IRMQExchange {
  name: string;
  queues: Record<string, IRMQQueue>;
  type: 'topic' | 'direct' | 'fanout';
}

export interface IRMQQueue {
  name: string;
  routes: Record<string, string>;
  // routes:any
}
