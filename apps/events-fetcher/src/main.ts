import { getMicroservicePath, SERVER_PREFIX } from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EventsFetcherModule } from './events-fetcher.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
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
    .addServer(SERVER_PREFIX)
    .addServer(`http://localhost:${PORT}`)
    .build();

  app.use(cookieParser());
  app.setGlobalPrefix('events-fetcher' satisfies MicroServiceName);
  app.enableCors({ origin: '*' });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath('events-fetcher').concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
