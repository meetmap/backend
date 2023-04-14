import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EventsFetcherModule } from './events-fetcher.module';

async function bootstrap() {
  const app = await NestFactory.create(EventsFetcherModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
