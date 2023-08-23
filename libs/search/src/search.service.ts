import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { IndicesCreate } from '@opensearch-project/opensearch/api/requestParams';
import { EventsSchema } from './schemas';
import { BaseSchema } from './schemas/base';

//https://github.com/opensearch-project/opensearch-js/blob/HEAD/USER_GUIDE.md
@Injectable()
export class SearchService implements OnModuleInit {
  private _client: Client = new Client({
    node: this.configService.getOrThrow('SEARCH_CLIENT_URL'),
  });

  constructor(private readonly configService: ConfigService) {}
  public async onModuleInit() {
    for (const key in this.indexes) {
      await this.indexes[key].createIndex();
    }
  }

  private indexHandler<T extends unknown = unknown>(
    indexName: string,
    schema: BaseSchema<T>,
  ) {
    return {
      createIndex: () => this.createOrUpdateIndex(indexName, schema),
      put: schema.putData, //.bind(schema),
      putBulk: schema.putDataBulk,
      search: schema.searchData,
    };
  }

  private async createOrUpdateIndex(
    indexName: string,
    schema: BaseSchema<unknown>,
    settings: IndicesCreate['body'] = {},
  ) {
    schema.loadClient(this._client, indexName);
    const { body: isAlreadyExists } = await this._client.indices.exists({
      index: indexName,
    });
    if (isAlreadyExists) {
      await this._client.indices.putMapping({
        index: indexName,
        body: schema.rawMappings,
      });
      return;
    }
    const index = await this._client.indices.create({
      index: indexName,
      body: {
        mappings: schema.rawMappings,
      },
    });
    console.log(`Index ${indexName} has been created`);
    return index;
  }

  public get client() {
    return this._client;
  }

  public get indexes() {
    return {
      events: this.indexHandler('events', EventsSchema),
      // tags: this.indexHandler('tags'),
    } satisfies Record<string, ReturnType<typeof this.indexHandler<any>>>;
  }
}
