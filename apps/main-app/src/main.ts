import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MainAppModule } from './main-app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroServiceName } from '@app/types';
import {
  CORS_ORIGINS,
  getMicroservicePath,
  getMicroserviceUrl,
  SERVER_PREFIX,
} from '@app/constants';

async function bootstrap() {
  const app = await NestFactory.create(MainAppModule);
  const PORT = process.env.PORT ?? 3001;
  const config = new DocumentBuilder()
    .setTitle('Main App')
    .setDescription('Main App microservice')
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

  app.setGlobalPrefix('main-app' satisfies MicroServiceName);
  app.enableCors({ origin: CORS_ORIGINS });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath('main-app').concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
