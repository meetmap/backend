import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MainAppModule } from './main-app.module';

async function bootstrap() {
  const app = await NestFactory.create(MainAppModule);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT ?? 3001;
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
