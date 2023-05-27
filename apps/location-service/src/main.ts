import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LocationServiceModule } from './location-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LocationServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT ?? 3002;
  app.setGlobalPrefix('location-service' satisfies MicroServiceName);
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
