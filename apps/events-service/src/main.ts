import {
  CORS_ORIGINS,
  getMicroservicePath,
  SERVER_PREFIX,
} from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { EventsFetcherModule } from './events-service.module';

async function bootstrap() {
  const microserviceName: MicroServiceName = 'events-service';
  const app = await NestFactory.create(EventsFetcherModule);
  const PORT = process.env.PORT ?? 3000;

  const config = new DocumentBuilder()
    .setTitle('Events Fetcher App')
    .setDescription('Events Fetcher microservice')
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
    .addBearerAuth(
      {
        description: 'Dashboard JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'dashboardAuth',
    )
    .addApiKey(
      {
        name: 'X-API-KEY',
        in: 'header',
        type: 'apiKey',
      },
      'ticketingPlatformApiAuth',
    )
    .addServer(SERVER_PREFIX)
    .addServer(`http://localhost:${PORT}`)
    .build();

  app.use(cookieParser());
  app.setGlobalPrefix(microserviceName);
  app.enableCors({ origin: CORS_ORIGINS });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath(microserviceName).concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT);
  console.log('App is running on port:', PORT);
  console.log('Local url:', `http://localhost:${PORT}/${microserviceName}/api`);
}
bootstrap();
