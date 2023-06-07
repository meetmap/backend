import { getMicroservicePath, SERVER_PREFIX } from '@app/constants';
import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Auth Service App')
    .setDescription('Auth microservice')
    .setVersion('latest')
    .addBearerAuth()
    .addServer(SERVER_PREFIX)
    .build();
  app.setGlobalPrefix('auth-service' satisfies MicroServiceName);
  app.enableCors({ origin: '*' });
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    getMicroservicePath('auth-service').concat('/api'),
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());

  const PORT = process.env.PORT ?? 3003;
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
