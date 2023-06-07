import { getMicroservicePath, SERVER_PREFIX } from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EventsFetcherModule } from './events-fetcher.module';

async function bootstrap() {
  const app = await NestFactory.create(EventsFetcherModule);

  const config = new DocumentBuilder()
    .setTitle('Events Fetcher App')
    .setDescription('Events Fetcher microservice')
    .setVersion('latest')
    .addBearerAuth()
    .addServer(SERVER_PREFIX)
    .build();
  app.setGlobalPrefix('events-fetcher' satisfies MicroServiceName);
  app.enableCors({ origin: '*' });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath('events-fetcher').concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
