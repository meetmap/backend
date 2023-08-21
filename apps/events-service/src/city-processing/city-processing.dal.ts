import { EventsServiceDatabase } from '@app/database';
import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { output } from './output';
@Injectable()
export class CityProcessingDal {
  constructor(private readonly db: EventsServiceDatabase) {}

  public async createCity() {
    // this.db.models.city.create({});
  }

  public async createCountry() {
    await this.db.models.country.updateOne(
      { en_name: 'Russia' },
      {
        $set: {
          location: output.geometry,
        },
      },
    );
  }

  public async getAllCities() {
    await this.createCountry();
    return await this.db.models.city.aggregate([
      { $match: { en_name: { $exists: false } } },
      {
        $project:
          /**
           * specifications: The fields to
           *   include or exclude.
           */
          {
            local_name: 1,
          },
      },
    ]);
  }

  public async updateCities() {
    // this.db.models.city.bulkWrite(
    //   cities.map((city) => ({
    //     updateOne: {
    //       filter: {
    //         "location.type":"Polygon",
    //       },
    //       update: {
    //         $set: {
    //           "location.coordinates": "$location.coordinates",
    //         },
    //       },
    //     },
    //   })),
    // );
  }
  public async updateCitiesCountry() {
    await this.db.models.city.updateMany(
      {},
      {
        $set: {
          countryId: new mongoose.Types.ObjectId('64de80fafb3277cbf09ea966'),
        },
      },
    );
    // this.db.models.city.bulkWrite(
    //   cities.map((city) => ({
    //     updateOne: {
    //       filter: {
    //         "location.type":"Polygon",
    //       },
    //       update: {
    //         $set: {
    //           "location.coordinates": "$location.coordinates",
    //         },
    //       },
    //     },
    //   })),
    // );
  }
}
