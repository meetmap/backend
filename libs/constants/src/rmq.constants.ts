export class RMQConstants {
  static get exchanges() {
    return {
      USERS: {
        name: 'user_events',
        type: 'direct',
        queues: {
          USER_SERVICE: 'users_service_queue',
          LOCATION_SERVICE: 'location_service_queue',
          EVENTS_SERVICE: 'events_service_queue',
        },
        routingKeys: {
          USER_CREATED: 'user.created',
          USER_UPDATED: 'user.updated',
          USER_DELETED: 'user.deleted',
          USER: 'user.#',
        },
      },
      FRIENDS: {
        name: 'friends_events',
        type: 'direct',
        queues: {
          LOCATION_SERVICE: 'location_service_friends_queue',
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
