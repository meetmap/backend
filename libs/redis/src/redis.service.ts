import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, SetOptions } from '@redis/client';
import * as redis from 'redis';

@Injectable()
export class RedisService<DataT = unknown> implements OnModuleInit {
  private readonly _client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    // console.log('redis', "https"process.env.SESSIONS_AND_CACHE_ENDPOINT);
    const url = 'redis://'.concat(configService.getOrThrow('CACHE_ENDPOINT'));
    this._client = redis.createClient({
      url,
      pingInterval: 10000,
    });
  }

  async onModuleInit() {
    await this._client.connect();
  }

  public async set(key: string, value: DataT, options: SetOptions) {
    return await this._client.set(key, this.serialize(value), options);
  }
  public async get(key: string) {
    const result = await this._client.get(key);
    if (result) {
      return this.deserialize(result);
    }
    return null;
  }

  public async getBulk(keys: string[]) {
    const result = await this._client.mGet(keys);
    return result.map((r) => (r ? this.deserialize(r) : null));
  }

  public async delete(key: string) {
    return await this._client.del(key);
  }

  private serialize(value: unknown) {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
  }
  private deserialize(value: string) {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as DataT;
  }
  get client() {
    return this._client;
  }
}
