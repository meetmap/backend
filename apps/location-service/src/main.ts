import {
  CORS_ORIGINS,
  getMicroservicePath,
  SERVER_PREFIX,
} from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { LocationServiceModule } from './location-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LocationServiceModule);
  const PORT = process.env.PORT ?? 3002;

  const config = new DocumentBuilder()
    .setTitle('Location Service')
    .setDescription('Location microservice')
    .setVersion('latest')
    .addBearerAuth(
      {
        description: 'Default JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'microserviceAuth',
    )
    .addServer(SERVER_PREFIX)
    .addServer(`http://localhost:${PORT}`)
    .build();
  app.setGlobalPrefix('location-service' satisfies MicroServiceName);
  app.enableCors({ origin: CORS_ORIGINS });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath('location-service').concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
