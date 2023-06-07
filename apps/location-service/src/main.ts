import { getMicroservicePath, SERVER_PREFIX } from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { LocationServiceModule } from './location-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LocationServiceModule);
  const config = new DocumentBuilder()
    .setTitle('Location Service')
    .setDescription('Location microservice')
    .setVersion('latest')
    .addBearerAuth()
    .addServer(SERVER_PREFIX)
    .build();
  app.setGlobalPrefix('location-service' satisfies MicroServiceName);
  app.enableCors({ origin: '*' });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath('location-service').concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT ?? 3002;
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
