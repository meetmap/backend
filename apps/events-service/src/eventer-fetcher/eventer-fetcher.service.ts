import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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

  public async getAndPublishValidEvent(eventSlug: string): Promise<void> {
    const slug = eventSlug.toLowerCase();
    const dbEvent = await this.dal.getDbEventBySlug(slug);
    if (this.validateEventExpiry(dbEvent)) {
      console.log('Fresh event found in DB!', dbEvent.slug);
      return;
    }
    console.log('Trying to fetch event from eventer');
    const event = await this.dal.fetchEventerFullEvent(slug);
    if (!event) {
      return;
    }

    const tickets = await this.dal.fetchEventerEventTickets(event.event._id);
    console.log('Event found!', event.event.linkName);

    const formattedEvent = this.mapEventerResponseToDbEvent(event, tickets);
    if (!formattedEvent) {
      return;
    }

    if (dbEvent) {
      const eventFromDb = dbEvent as AppTypes.EventsService.Event.IEvent;
      console.log(`Updating event: ${slug}`);

      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.EVENT_PROCESSING.name,
        RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
          .EVENT_PROCESSING_UPDATE_REQUESTED,
        AppDto.TransportDto.Events.UpdateTicketingPlatformEventRequestDto.create(
          {
            ...formattedEvent,
            tagsCids: undefined,
            cid: eventFromDb.cid,
          },
        ),
      );
      return;
    }

    console.log(`Creating event: ${slug}`);
    // const newEvent = await this.dal.createEvent(formattedEvent);
    //if new event, publish event.created event
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.EVENT_PROCESSING.name,
      RMQConstants.exchanges.EVENT_PROCESSING.routingKeys
        .EVENT_PROCESSING_CREATE_REQUESTED,
      AppDto.TransportDto.Events.CreateTicketingPlatformEventRequestDto.create({
        ...formattedEvent,
      }),
    );
    return;
  }

  public mapEventerResponseToDbEvent(
    event: AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerFullEventResponse,
    tickets: AppTypes.TicketingPlatforms.ThirdParty.EventerCoIl.IEventerTicketsResponse | null,
  ): AppDto.TransportDto.Events.CreateTicketingPlatformEventRequestDto | null {
    const location = event.event.location;
    if (!location.latitude || !location.longitude) {
      return null;
    }
    if (!event.event.ticketPlatform.images?.imageSquare) {
      return null;
    }
    return {
      accessibility: AppTypes.EventsService.Event.EventAccessibilityType.PUBLIC,
      title: event.event.name,
      ageLimit: event.event.guestInfoFields?.age.ageLimit ?? 1,
      assetsUrls: [event.event.ticketPlatform.images.imageSquare],
      slug: event.event.linkName,
      link: this.generateAffiliateLink(event.event.linkName),
      description: event.jsonLdData.description,
      startTime: new Date(event.event.schedule.start),
      endTime: new Date(event.event.schedule.end),
      location: {
        lng: location.longitude,
        lat: location.latitude,
      },
      tagsCids: [],
      tickets: (tickets?.ticketTypes ?? []).map((ticket) => ({
        amount: ticket.remaining,
        description: ticket.description,
        name: ticket.name,
        price: ticket.price,
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
