import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitMQModule, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { RabbitMQExchanges } from '@app/constants';
import { deserializeMessage, serializeMessage } from './serialization';

// @Module({
//   providers: [RabbitmqService],
//   exports: [RabbitmqService],
// })
export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory(configService: ConfigService) {
            const connectionString =
              configService.getOrThrow<string>('RABBIT_MQ_URL');
            return {
              uri: connectionString,
              exchanges: [
                {
                  createExchangeIfNotExists: true,
                  name: RabbitMQExchanges.LOCATION_EXCHANGE,
                  type: 'direct',
                },
              ],
              enableControllerDiscovery: true,
              serializer: serializeMessage,
              deserializer: deserializeMessage,
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqService],
      exports: [RabbitmqService],
      global: true,
    };
  }
}
