export enum EventsUsersStatusType {
  WANT_GO = 'want-go',
  APPROVED = 'approved',
  TICKETS_PURCHASED = 'tickets-purchased',
}

export interface IEventsUsers {
  eventCid: string;
  userCId: string;
  userStatus?: EventsUsersStatusType;
  isUserLike: boolean;
}
