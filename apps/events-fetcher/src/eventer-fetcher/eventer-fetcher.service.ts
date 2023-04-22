import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventerFetcherDal } from './eventer-fetcher.dal';
import {
  EventType,
  ICity,
  IEvent,
  IEventerFullEventResponse,
  IEventerTicketsResponse,
} from '@app/types';
import { Cron } from '@nestjs/schedule';
import * as mongoose from 'mongoose';

@Injectable()
export class EventerFetcherService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly dal: EventerFetcherDal) {}
  public async onModuleDestroy() {}

  public async onModuleInit() {
    // this.getAllCountryEvents();
  }

  @Cron('0,30 * * * *')
  public async getAllCountryEvents() {
    const cities = await this.dal.getAllCities();
    console.log('Number of cities:', cities.length);
    for (const city of cities) {
      const events = await this.dal.fetchEventerList(city.name);

      for (const event of events) {
        if (!event.linkName) {
          continue;
        }
        await this.getValidEvent(event.linkName.toLowerCase());
        // return;
        // debugger;
      }
    }
    console.log('Finished!');
  }

  public async getValidEvent(eventSlug: string): Promise<IEvent | null> {
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
    const city = await this.extractCityFromEventerResponse(event);
    const payload = this.mapEventerResponseToDbEvent(event, tickets, city);
    if (!payload) {
      return null;
    }

    if (dbEvent) {
      return await this.dal.updateEvent(dbEvent.id, payload);
    }
    return await this.dal.storeEvent(payload);
  }

  public async extractCityFromEventerResponse(
    event: IEventerFullEventResponse,
  ): Promise<ICity | null> {
    const { longitude, latitude } = event.event.location;
    if (!longitude || !latitude) {
      return null;
    }
    const city = await this.dal.getCityByCoordinates(longitude, latitude);
    city
      ? console.log('City found!', city.name)
      : console.log('City not found :(');

    return city;
  }

  public mapEventerResponseToDbEvent(
    event: IEventerFullEventResponse,
    tickets: IEventerTicketsResponse | null,
    city: ICity | null,
  ): Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'> | null {
    const location = event.event.location;
    if (!location.latitude || !location.longitude) {
      return null;
    }
    return {
      title: event.event.name,
      ageLimit: event.event.guestInfoFields?.age.ageLimit ?? 1,
      picture: event.event.ticketPlatform.images?.imageSquare,
      slug: event.event.linkName,
      link: this.generateAffiliateLink(event.event.linkName),
      description: event.jsonLdData.description,
      startTime: new Date(event.event.schedule.start),
      endTime: new Date(event.event.schedule.end),
      location: {
        cityId: city ? new mongoose.Types.ObjectId(city.id) : undefined,
        country: 'Israel',
        coordinates: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
      },
      eventType: EventType.PARTNER_EVENT,
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
  public validateEventExpiry(event: IEvent | null): event is IEvent {
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
