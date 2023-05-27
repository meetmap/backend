import { MicroServiceName } from '@app/types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Auth App')
    .setDescription('Auth microservice')
    .setVersion('latest')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT ?? 3003;
  app.setGlobalPrefix('auth-service' satisfies MicroServiceName);
  await app.listen(PORT);
  console.log('App is running on port:', PORT);
}
bootstrap();
