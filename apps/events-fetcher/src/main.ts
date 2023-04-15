import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EventsFetcherModule } from './events-fetcher.module';

async function bootstrap() {
  const app = await NestFactory.create(EventsFetcherModule);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
