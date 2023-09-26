import { AssetsServiceDatabase } from '@app/database';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EventsDal implements OnModuleInit {
  constructor(private readonly db: AssetsServiceDatabase) {}

  onModuleInit() {}

  public async createEvent(
    payload: AppDto.TransportDto.Events.CreateEventPayload,
  ) {
    return await this.db.models.events.create({
      cid: payload.cid,
      creator: payload.creator
        ? {
            creatorCid: payload.creator.creatorCid,
            type: payload.creator.type,
          }
        : undefined,
      assets: [],
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AssetsSerivce.Events.IEvent>);
  }

  public async deleteEvent(eventCid: string) {
    await this.db.models.events.deleteOne({ cid: eventCid });
    //@todo delete all related images
    // await this.db.models.eventsAssets.deleteMany({ eventCid: eventCid });
    return eventCid;
  }

  public async attachAssetsToEvent(eventCid: string, assetsCids: string[]) {
    //@todo make logic with ordering
    await this.db.session(async (session) => {
      const event = await this.db.models.events
        .findOne({ cid: eventCid })
        .session(session)
        .lean();
      if (!event) {
        throw new Error('Event not found');
      }

      await this.db.models.events.findByIdAndUpdate(event.id, {
        $set: { assets: event.assets.concat(assetsCids).slice(0, 10) },
      });
    });
  }
}
