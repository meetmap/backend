import { RabbitmqModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsServiceController } from './jobs-service.controller';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitmqModule.forRoot(),

    SchedulerModule,
  ],
  controllers: [JobsServiceController],
  providers: [],
})
export class JobsServiceModule {}
