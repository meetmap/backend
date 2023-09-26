import { Event } from '../eventsService';

export type EventProcessing = IEventProcessing | IEventProcessingFailed;

export interface IEventProcessing {
  id: string;
  /**
   * @unique
   */
  cid: string;
  creator?: Event.ICreator;
  /**
   * in case of queue fails, backup purpose
   */
  rawEvent: string;

  eventCid: string;

  status: ProcessingStatus;
  failureReason?: string;
  type: ProcessingType;
}

export enum ProcessingType {
  USER_EVENT_CREATE = 'user_event_create',
  USER_EVENT_UPDATE = 'user_event_update',
  THIRD_PARTY_EVENT_CREATE = 'third_party_event_create',
  THIRD_PARTY_EVENT_UPDATE = 'third_party_event_update',
  THIRD_PARTY_SYSTEM_EVENT_CREATE = 'third_party_system_event_create',
  THIRD_PARTY_SYSTEM_EVENT_UPDATE = 'third_party_system_event_update',
}

export interface IEventProcessingFailed
  extends Omit<IEventProcessing, 'failureReason' | 'status'> {
  status: ProcessingStatus.FAILED;
  failureReason: string;
}

export enum ProcessingStatus {
  /**
   * initialized
   */
  INITIALIZED = 'initialized',
  /**
   * created in db
   */
  EVENT_CREATED = 'event_created',

  /**
   * updated in db
   */
  EVENT_UPDATED = 'event_updated',

  /**
   * ai moderation
   */
  MODERATED = 'moderated',

  /**
   * tags assign
   */
  TAGS_ASSIGNED = 'tags_assigned',

  /**
   * success
   */
  SUCCEEDED = 'succeeded',
  /**
   * failure
   */
  FAILED = 'failed',
}

/**
 *
 * @param current
 * @returns 1st - succeed, 2nd - failed, null means final
 */
export const getNextProcessingStatus = (
  current: ProcessingStatus,
): [ProcessingStatus, ProcessingStatus] | [null, null] => {
  if (current === ProcessingStatus.INITIALIZED) {
    return [ProcessingStatus.EVENT_CREATED, ProcessingStatus.FAILED];
  }
  if (current === ProcessingStatus.EVENT_CREATED) {
    return [ProcessingStatus.MODERATED, ProcessingStatus.FAILED];
  }

  if (current === ProcessingStatus.MODERATED) {
    return [ProcessingStatus.TAGS_ASSIGNED, ProcessingStatus.FAILED];
  }

  if (current === ProcessingStatus.TAGS_ASSIGNED) {
    return [ProcessingStatus.SUCCEEDED, ProcessingStatus.FAILED];
  }

  return [null, null];
};
