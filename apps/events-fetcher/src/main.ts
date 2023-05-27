import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EventsFetcherModule } from './events-fetcher.module';

async function bootstrap() {
  const app = await NestFactory.create(EventsFetcherModule);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT ?? 3000;
  app.setGlobalPrefix('events-fetcher' satisfies MicroServiceName);
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
