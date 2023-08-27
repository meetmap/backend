import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { YandexAfishaCrawlerDal } from './yandex-afisha-crawler.dal';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

@Injectable()
export class YandexAfishaCrawlerService {
  private readonly creatorCid: string | null = null;
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
    }
  }

  public async getAndPublishValidEvent(
    rawEvent: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ): Promise<void> {
    if (!this.isValidAfishaEventDate(rawEvent)) {
      return;
    }
    const slug = YandexAfishaCrawlerService.getEventSlug(rawEvent);
    console.log(`Preparing event: ${slug}`);
    const dbEvent = await this.dal.getDbEventBySlug(slug);
    if (this.validateEventExpiry(dbEvent)) {
      console.log('Fresh event found in DB!', dbEvent.slug);
      return;
    }

    const formattedEvent = this.mapToTicketingPlatformEvent(rawEvent);

    if (!formattedEvent) {
      return;
    }

    //if expired
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

  public isValidAfishaEventDate(
    rawEvent: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ) {
    const event = this.mapToTicketingPlatformEvent(rawEvent);

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

  public mapToTicketingPlatformEvent(
    event: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ): AppDto.TransportDto.Events.CreateTicketingPlatformEventRequestDto | null {
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
      title: event.event.title,
      description: event.event.argument ?? undefined,
      assetsUrls: [
        event.event.image.sizes.eventCoverL2x.url ??
          event.event.image.sizes.eventCoverL.url ??
          event.event.image.sizes.eventCoverM.url ??
          event.event.image.sizes.eventCover.url,
      ],
      endTime: new Date(event.scheduleInfo.dateEnd),
      startTime: new Date(event.scheduleInfo.dateStarted),
      tagsCids: [],
      location: {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      },
      slug: YandexAfishaCrawlerService.getEventSlug(event),
      tickets: event.event.tickets.slice(0, 10).map((ticket) => ({
        amount: ticket.saleStatus === 'available' ? -1 : 0,
        name: `Ticket#${ticket.id}`,
        price: ticket.price
          ? parseInt(
              (
                (ticket.price.value ??
                  ticket.price.min ??
                  ticket.price.max ??
                  0) / 100
              ).toString(),
            ) ?? 0
          : 0,
      })),
      link: YandexAfishaCrawlerService.getAffiliateLink(event.event.url),
    };
  }

  public extractLocationFromEventerResponse(
    event: AppTypes.TicketingPlatforms.ThirdParty.YandexAfisha.ISingleEvent,
  ): {
    lat: number;
    lng: number;
  } | null {
    const coordinates = event.scheduleInfo.onlyPlace?.coordinates;
    if (!coordinates) {
      return null;
    }
    const { latitude, longitude } = coordinates;
    return {
      lat: latitude,
      lng: longitude,
    };
  }

  static getAffiliateLink(url: string) {
    return `https://afisha.yandex.ru${url}`;
  }
}
