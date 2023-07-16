import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import { IDatabaseServiceConfig } from './types';

// export interface IBaseDatabase extends OnModuleInit, OnModuleDestroy {
//     new(config:IDatabaseServiceConfig)
//   models: Record<string, mongoose.Model<any>>;
//   session: (
//     callback: (session: mongoose.ClientSession) => Promise<void>,
//   ) => void;
// }

export class AbstractBaseDatabase implements OnModuleInit, OnModuleDestroy {
  protected connection: mongoose.Connection;
  constructor(private readonly config: IDatabaseServiceConfig) {}
  public async onModuleInit() {
    this.connection = await mongoose
      .createConnection(this.config.connectionString)
      .asPromise();

    // const model = this.connection.model('User', UserSchema);
    // console.log({ model });
  }
  public async onModuleDestroy() {
    await this.connection.close();
  }
  public async session(
    callback: (session: mongoose.ClientSession) => Promise<void>,
  ) {
    const session = await this.connection.startSession({
      defaultTransactionOptions: {
        readConcern: 'majority',
        writeConcern: {
          w: 'majority',
        },
      },
    });
    // session.withTransaction(
    //     async (session)=>{

    //     }
    // )
    session.startTransaction();
    try {
      await callback(session);
      await session.commitTransaction();
    } catch (error) {
      console.log('Transaction error: ', error);
      await session.abortTransaction();
      await session.endSession();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public get models(): Record<string, mongoose.Model<any>> {
    return {};
  }
}
