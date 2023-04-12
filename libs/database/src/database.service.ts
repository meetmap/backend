import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { CitySchema, EventSchema } from './models';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  async onModuleInit() {
    const connectionString = this.configService.getOrThrow('DATABASE_URL');
    await mongoose.connect(connectionString);
  }

  public get models() {
    return {
      event: mongoose.model('Event', EventSchema),
      city: mongoose.model('City', CitySchema),
    };
  }
}
