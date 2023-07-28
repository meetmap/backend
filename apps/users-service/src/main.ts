import {
  CORS_ORIGINS,
  getMicroservicePath,
  SERVER_PREFIX,
} from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MainAppModule } from './users-service.module';

async function bootstrap() {
  const microserviceName: MicroServiceName = 'users-service';
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
