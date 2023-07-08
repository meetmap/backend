import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';

import { BaseDatabase, IDatabaseServiceConfig } from '../types';
import { FriendsSchema, UserSchema } from './models';

@Injectable()
export class LocationServiceDatabase implements BaseDatabase {
  constructor(private readonly config: IDatabaseServiceConfig) {}
  async onModuleInit() {
    // const connectionString = this.configService.getOrThrow('DATABASE_URL');
    await mongoose.connect(this.config.connectionString);
  }

  public get models() {
    return {
      users: mongoose.model('User', UserSchema),
      friends: mongoose.model('Friends', FriendsSchema),
    };
  }
}
