import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LocationServiceModule } from './location-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LocationServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3002);
}
bootstrap();
