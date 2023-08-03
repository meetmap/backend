import { AppDto } from '@app/dto';
import { Injectable } from '@nestjs/common';
import { EventsDal } from './events.dal';

@Injectable()
export class EventsService {
  constructor(private readonly dal: EventsDal) {}

  public async handleCreateEvent(
    payload: AppDto.TransportDto.Events.EventsServiceEventRequestDto,
  ) {
    await this.dal.createEvent(payload);
  }

  public async handleDeleteEvent(
    payload: AppDto.TransportDto.Events.EventsServiceEventRequestDto,
  ) {
    await this.dal.deleteEvent(payload.cid);
  }
}
