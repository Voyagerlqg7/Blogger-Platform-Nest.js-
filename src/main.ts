import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exception.filter';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((error) => ({
          message: Object.values(error.constraints || {}).join(', '),
          field: error.property,
        }));

        return new BadRequestException({
          errorsMessages: errorMessages,
        });
      },
    }),
  );

  app.useGlobalFilters(
    new DomainHttpExceptionsFilter(),
    new AllHttpExceptionsFilter(),
  );

  app.use(cookieParser());

  await app.listen(6419);
}

bootstrap();
