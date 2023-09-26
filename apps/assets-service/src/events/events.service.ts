import { AppDto } from '@app/dto';
import { Injectable } from '@nestjs/common';
import { EventsDal } from './events.dal';

@Injectable()
export class EventsService {
  constructor(private readonly dal: EventsDal) {}

  public async handleCreateEvent(
    payload: AppDto.TransportDto.Events.CreateEventPayload,
  ) {
    await this.dal.createEvent(payload);
  }

  public async deleteEvent(eventCid: string) {
    await this.dal.deleteEvent(eventCid);
  }

  public async attachAssetsToEvent(eventCid: string, assetsCids: string[]) {
    return await this.dal.attachAssetsToEvent(eventCid, assetsCids);
  }
}
