import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
import { EventerFetcherDal } from './eventer-fetcher.dal';

@Injectable()
export class EventerFetcherService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly dal: EventerFetcherDal,
    private readonly rmqService: RabbitmqService,
  ) {}
  public async onModuleDestroy() {}

  public async onModuleInit() {
    // this.getAllCountryEvents();
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey: [
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_EVENTER_CO_IL_SYNC_REQUEST,
    ],
    queue: 'events-service.sync.eventer_co_il',
  })
  public async getAllCountryEvents() {
    const cities = await this.dal.getAllCities();
    console.log('Number of cities:', cities.length);
    for (const city of cities) {
      const events = await this.dal.fetchEventerList(city.local_name);

      for (const event of events) {
        if (!event.linkName) {
          continue;
        }
        await this.getAndPublishValidEvent(event.linkName.toLowerCase());
      }
    }
    console.log('Finished!');
  }

  public async getAndPublishValidEvent(
    eventSlug: string,
  ): Promise<AppTypes.EventsService.Event.IEvent | null> {
    const slug = eventSlug.toLowerCase();
    const dbEvent = await this.dal.getDbEventBySlug(slug);
    if (this.validateEventExpiry(dbEvent)) {
      console.log('Fresh event found in DB!', dbEvent.slug);
      return dbEvent;
    }
    console.log('Trying to fetch event from eventer');
    const event = await this.dal.fetchEventerFullEvent(slug);
    if (!event) {
      return null;
    }

    const tickets = await this.dal.fetchEventerEventTickets(event.event._id);
    console.log('Event found!', event.event.linkName);

    const location = await this.extractLocationFromEventerResponse(
      event,
      dbEvent,
    );
    const payload = this.mapEventerResponseToDbEvent(
      event,
      tickets,
      location?.countryId ?? null,
      location?.localityId ?? null,
    );
    if (!payload) {
      return null;
    }

    if (dbEvent) {
      const updatedEvent = await this.dal.updateEvent(
        dbEvent.id,
        dbEvent.cid,
        payload,
      );
      if (!updatedEvent) {
        return null;
      }

      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENTS.name,
        RMQConstants.exchanges.EVENTS.routingKeys.EVENT_UPDATED,
        AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
          cid: updatedEvent.cid,
          creator: undefined,
        }),
      );

      ///if no tags has been assigned to an event, publish event to assign tags
      if (!updatedEvent.tagsCids.length) {
        await this.rmqService.amqp.publish(
          RMQConstants.exchanges.EVENTS.name,
          RMQConstants.exchanges.EVENTS.routingKeys.ASSIGN_TAGS,
          AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
            cid: updatedEvent.cid,
            creator: undefined,
          }),
        );
      }
      return updatedEvent;
    }

    const newEvent = await this.dal.storeEvent(payload);
    //if new event, publish event.created event
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENTS.name,
      RMQConstants.exchanges.EVENTS.routingKeys.EVENT_CREATED,
      AppDto.TransportDto.Events.EventsServiceEventRequestDto.create({
        cid: newEvent.cid,
        creator: undefined,
      }),
    );
    return newEvent;
  }

  public async extractLocationFromEventerResponse(
    event: AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerFullEventResponse,
    dbEvent: AppTypes.EventsService.Event.IEvent | null,
  ): Promise<{
    countryId?: string;
    localityId?: string;
  } | null> {
    const { longitude, latitude } = event.event.location;
    if (!longitude || !latitude) {
      return null;
    }

    if (dbEvent) {
      const [lng, lat] = dbEvent.location.coordinates.coordinates;
      if (longitude === lng && latitude === lat) {
        return {
          countryId: dbEvent.location.countryId?.toString(),
          localityId: dbEvent.location.localityId?.toString(),
        };
      }
    }

    return await this.dal.lookupLocalityByCoordinates({
      lat: latitude,
      lng: longitude,
    });
  }

  public mapEventerResponseToDbEvent(
    event: AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerFullEventResponse,
    tickets: AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerTicketsResponse | null,
    countryId: string | null,
    localityId: string | null,
  ): AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent> | null {
    const location = event.event.location;
    if (!location.latitude || !location.longitude) {
      return null;
    }
    return {
      accessibility: AppTypes.EventsService.Event.EventAccessibilityType.PUBLIC,
      title: event.event.name,
      ageLimit: event.event.guestInfoFields?.age.ageLimit ?? 1,
      assets: event.event.ticketPlatform.images?.imageSquare
        ? [event.event.ticketPlatform.images?.imageSquare]
        : [],
      slug: event.event.linkName,
      link: this.generateAffiliateLink(event.event.linkName),
      description: event.jsonLdData.description,
      startTime: new Date(event.event.schedule.start),
      endTime: new Date(event.event.schedule.end),
      location: {
        localityId: localityId
          ? new mongoose.Types.ObjectId(localityId)
          : undefined,
        countryId: countryId
          ? new mongoose.Types.ObjectId(countryId)
          : undefined,
        coordinates: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
      },
      cid: randomUUID(),
      eventType: AppTypes.EventsService.Event.EventType.PARTNER,
      tagsCids: [],
      tickets: (tickets?.ticketTypes ?? []).map((ticket) => ({
        amount: ticket.remaining,
        description: ticket.description,
        name: ticket.name,
        price: {
          amount: ticket.price,
          currency: 'ILS',
        },
      })),
    };
  }
  public validateEventExpiry(
    event: AppTypes.EventsService.Event.IEvent | null,
  ): event is AppTypes.EventsService.Event.IEvent {
    const ONE_HOUR = 60 * 60 * 1000;
    if (!event) {
      return false;
    }
    if (+new Date(event.updatedAt) + ONE_HOUR < Date.now()) {
      return false;
    }
    return true;
  }

  public generateAffiliateLink(eventSlug: string) {
    return `https://www.eventer.co.il/events/${eventSlug}`;
  }
}
