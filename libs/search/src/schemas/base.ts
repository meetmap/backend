import { Client } from '@opensearch-project/opensearch';
import { Search } from '@opensearch-project/opensearch/api/requestParams';

export class BaseSchema<DataType> {
  private _client: Client | null = null;
  private _indexName: string | null = null;
  constructor(protected readonly schema: DataTypeToSchema<DataType>) {}

  public loadClient(client: Client, indexName: string) {
    this._client = client;
    this._indexName = indexName;
  }

  public get client() {
    if (!this._client) {
      throw new Error('Load client first');
    }
    return this._client;
  }

  public get indexName() {
    if (!this._indexName) {
      throw new Error('Load indexName first');
    }
    return this._indexName;
  }

  public get rawMappings(): { properties: ISchemaProperties } {
    return {
      properties: {
        ...this.stripOptionalField(this.schema),
        // ...this.schema,
      },
    };
  }

  public searchData = async (
    query: Search<Omit<Record<string, any>, 'index'>>,
  ) => {
    const data = await this.client.search<ElasticsearchResponse<DataType>>({
      ...query,
      index: this.indexName,
    });
    return data.body;
  };

  public putData = async (data: Omit<DataType, '_id'> & { _id?: string }) => {
    return await this.client.index({
      index: this.indexName,
      id: data._id,
      body: { ...data, _id: undefined } as Record<string, any>,
    });
  };

  public putDataBulk = async (
    data: (Omit<DataType, '_id'> & { _id?: string })[],
  ) => {
    return await this.client.bulk({
      body: data
        .map(({ _id, ...d }) => [
          {
            index: {
              _index: this.indexName,
              _id: _id,
            },
          },
          {
            ...d,
          },
        ])
        .flat(),
    });
  };

  private stripOptionalField(schema: ISchemaProperties): ISchemaProperties {
    const result: ISchemaProperties = {};

    for (const key in schema) {
      const { optional, term_vector, ...rest } = schema[key]; // Remove the "optional" key

      if (rest.type === 'nested' && rest.properties) {
        result[key] = {
          ...rest,
          properties: this.stripOptionalField(rest.properties),
        };
      } else {
        result[key] = rest;
      }
    }

    return result;
  }
}

export type SchemaFieldType =
  | 'text'
  | 'integer'
  | 'nested'
  | 'keyword'
  | 'date';

export interface ISchemaProperties {
  [fieldName: string]: ISchemaField | ISchemaFieldNested;
}

export interface ISchemaField {
  type: Exclude<SchemaFieldType, 'nested'>;
  analyzer?: 'standard';
  term_vector?: 'yes';
  optional?: boolean;
}

export interface ISchemaDateField {
  type: Extract<SchemaFieldType, 'date'>;
  format?: string;
}

export interface ISchemaFieldNested
  extends Omit<ISchemaField, 'type' | 'analyzer'> {
  type: Extract<SchemaFieldType, 'nested'>;

  properties: ISchemaProperties;
}

// type SchemaToDataType<T extends ISchemaProperties> = { id?: string } & {
//   [K in keyof T]: T[K] extends { optional: true } // Check if optional is true
//     ? T[K] extends ISchemaFieldNested
//       ? Array<SchemaToDataType<T[K]['properties']>> | undefined
//       : T[K]['type'] extends 'text' | 'keyword'
//       ? string | undefined
//       : T[K]['type'] extends 'integer'
//       ? number | undefined
//       : never
//     : T[K] extends ISchemaFieldNested
//     ? Array<SchemaToDataType<T[K]['properties']>>
//     : T[K]['type'] extends 'text' | 'keyword'
//     ? string
//     : T[K]['type'] extends 'integer'
//     ? number
//     : never;
// };

type DataTypeToSchemaField<T> = T extends string
  ? { type: 'text' | 'keyword' } & ISchemaField
  : T extends number
  ? { type: 'integer' } & ISchemaField
  : T extends Array<infer U>
  ? {
      type: 'nested';
      properties: DataTypeToSchema<U>;
    }
  : T extends Date
  ? ISchemaDateField
  : never;

type DataTypeToSchema<T> = {
  [K in keyof Omit<T, '_id'>]-?: DataTypeToSchemaField<T[K]>;
};

export interface ElasticsearchResponse<T> {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gte';
    };
    max_score: number;
    hits: Array<ElasticsearchHit<T>>;
  };
}

export interface ElasticsearchHit<T> {
  _index?: string;
  _type?: string;
  _id?: string;
  _score?: number;
  _source: T; // This represents the actual stored document
  // ... (other possible Elasticsearch hit fields)
}
