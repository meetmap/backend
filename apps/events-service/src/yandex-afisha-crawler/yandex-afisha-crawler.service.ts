import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
import { YandexAfishaCrawlerDal } from './yandex-afisha-crawler.dal';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

@Injectable()
export class YandexAfishaCrawlerService {
  constructor(
    private readonly dal: YandexAfishaCrawlerDal,
    private readonly rmqService: RabbitmqService,
  ) {}

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey:
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_YANDEX_AFISHA_SYNC_REQUEST,
    queue: 'events-service.sync.yandex_afisha',
  })
  public async handleStartJob() {
    // const cities = await this.dal.getAllAfishaCities();

    for (const city of ['moscow', 'saint-petersburg']) {
      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.JOBS.name,
        RMQConstants.exchanges.JOBS.routingKeys
          .EVENTS_SERVICE_YANDEX_AFISHA_SYNC_CITY_REQUEST,
        AppDto.TransportDto.Jobs.CrawlCityEventsJobPayload.create({
          city,
        }),
        {
          expiration: 60000, //60s
        },
      );
    }
  }

  @RabbitSubscribe({
    exchange: RMQConstants.exchanges.JOBS.name,
    routingKey:
      RMQConstants.exchanges.JOBS.routingKeys
        .EVENTS_SERVICE_YANDEX_AFISHA_SYNC_CITY_REQUEST,
    queue: 'events-service.sync.yandex_afisha.city',
  })
  public async handleCityEventsCrawl(
    @RabbitPayload()
    payload: AppDto.TransportDto.Jobs.CrawlCityEventsJobPayload,
  ) {
    try {
      console.log(`Parsing city: ${payload.city} started`);
      for await (const eventsBatch of this.dal.getAllEventsForCityIterable(
        payload.city,
      )) {
        await Promise.allSettled(
          eventsBatch.map((event) => this.getAndPublishValidEvent(event)),
        );
      }
      console.log(`Parsing city: ${payload.city} finished`);
    } catch (error) {
      console.log(error);
      debugger;
    }
  }

  public async getAndPublishValidEvent(
    rawEvent: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ): Promise<AppTypes.EventsService.Event.IEvent | null> {
    if (!this.isValidAfishaEventDate(rawEvent)) {
      return null;
    }
    const slug = YandexAfishaCrawlerService.getEventSlug(rawEvent);
    console.log(`Preparing event: ${slug}`);
    const dbEvent = await this.dal.getDbEventBySlug(slug);
    if (this.validateEventExpiry(dbEvent)) {
      console.log('Fresh event found in DB!', dbEvent.slug);
      return dbEvent;
    }

    const location = await this.extractLocationFromEventerResponse(
      rawEvent,
      dbEvent,
    );
    const formattedEvent = YandexAfishaCrawlerService.mapToDbEvent(
      rawEvent,
      location?.countryId ?? null,
      location?.localityId ?? null,
    );

    if (!formattedEvent) {
      return null;
    }
    //if expired
    if (dbEvent) {
      const eventFromDb = dbEvent as AppTypes.EventsService.Event.IEvent;
      const updatedEvent = await this.dal.updateEvent(
        eventFromDb.cid,
        formattedEvent,
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

    const newEvent = await this.dal.createEvent(formattedEvent);
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

  public isValidAfishaEventDate(
    rawEvent: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ) {
    const event = YandexAfishaCrawlerService.mapToDbEvent(rawEvent, null, null);

    if (!event) {
      return false;
    }

    if (event.startTime.getTime() > Date.now() + ONE_DAY * 31) {
      ///start in more than 2 month
      return false;
    }

    if (event.endTime.getTime() < Date.now() - ONE_DAY) {
      ///ended more than day ago
      return false;
    }
    return true;
  }

  public validateEventExpiry(
    event: AppTypes.EventsService.Event.IEvent | null,
  ): event is AppTypes.EventsService.Event.IEvent {
    if (!event) {
      return false;
    }
    if (+new Date(event.updatedAt) + ONE_DAY < Date.now()) {
      return false;
    }
    return true;
  }

  static getEventSlug(
    event: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ) {
    return `yandex_afisha:${event.event.id}`;
  }

  static mapToDbEvent(
    event: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
    countryId: string | null,
    localityId: string | null,
  ): AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.EventsService.Event.IEvent> | null {
    const coordinates = event.scheduleInfo.onlyPlace?.coordinates;
    if (!event.event.image) {
      return null;
    }
    if (!coordinates) {
      return null;
    }
    return {
      accessibility: AppTypes.EventsService.Event.EventAccessibilityType.PUBLIC,
      ageLimit: parseInt(event.event.contentRating) ?? 0,
      cid: randomUUID(),
      title: event.event.title,
      description: event.event.argument,
      assets: [event.event.image.sizes.eventCover.url],
      endTime: new Date(event.scheduleInfo.dateEnd),
      startTime: new Date(event.scheduleInfo.dateStarted),
      eventType: AppTypes.EventsService.Event.EventType.PARTNER,
      tagsCids: [],
      location: {
        coordinates: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
        localityId: localityId
          ? new mongoose.Types.ObjectId(localityId)
          : undefined,
        countryId: countryId
          ? new mongoose.Types.ObjectId(countryId)
          : undefined,
      },
      slug: YandexAfishaCrawlerService.getEventSlug(event),
      tickets: event.event.tickets.map((ticket) => ({
        amount: ticket.saleStatus === 'available' ? -1 : 0,
        name: `Ticket#${ticket.id}`,
        price: {
          amount: ticket.price
            ? parseInt(
                (
                  (ticket.price.value ??
                    ticket.price.min ??
                    ticket.price.max ??
                    0) / 100
                ).toString(),
              ) ?? 0
            : 0,
          currency: ticket.price?.currency ?? 'rub',
        },
      })),
      link: YandexAfishaCrawlerService.getAffiliateLink(event.event.url),
    };
  }

  public async extractLocationFromEventerResponse(
    event: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
    dbEvent: AppTypes.EventsService.Event.IEvent | null,
  ): Promise<{
    countryId?: string;
    localityId?: string;
  } | null> {
    try {
      const coordinates = event.scheduleInfo.onlyPlace?.coordinates;
      if (!coordinates) {
        return null;
      }
      const { latitude, longitude } = coordinates;

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
    } catch (error) {
      console.warn('Error in extractLocationFromEventerResponse');
      return null;
    }
  }

  static getAffiliateLink(url: string) {
    return `https://afisha.yandex.ru${url}`;
  }
}
