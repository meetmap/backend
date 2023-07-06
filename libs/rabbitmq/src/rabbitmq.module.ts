import { RMQConstants } from '@app/constants';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqService } from './rabbitmq.service';
import { deserializeMessage, serializeMessage } from './serialization';
// import { RmqLibModule } from '@app/rmq-lib';

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
              exchanges: Object.values(RMQConstants.exchanges).map(
                (exchange) => ({
                  createExchangeIfNotExists: true,
                  name: exchange.name,
                  type: exchange.type,
                }),
              ),
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
