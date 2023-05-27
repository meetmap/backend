import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mongoose from 'mongoose';

import { BaseDatabase, IDatabaseServiceConfig } from '../types';
import { UserSchema } from './models/user';

@Injectable()
export class AuthServiceDatabase implements BaseDatabase {
  constructor(private readonly config: IDatabaseServiceConfig) {}
  async onModuleInit() {
    // const connectionString = this.configService.getOrThrow('DATABASE_URL');
    await mongoose.connect(this.config.connectionString);
  }

  public get models() {
    return {
      users: mongoose.model('User', UserSchema),
    };
  }
}
