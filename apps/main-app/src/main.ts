import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MainAppModule } from './main-app.module';

async function bootstrap() {
  const app = await NestFactory.create(MainAppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
}
bootstrap();
