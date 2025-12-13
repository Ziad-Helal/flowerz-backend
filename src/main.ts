import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { swaggerConfig } from 'common/docs/swagger.config';
import { GlobalErrorsFilter } from 'common/errors/global-errors.filter';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalErrorsFilter());
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => errors,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  swaggerConfig(app);

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
