import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
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
  process.on('unhandledRejection', (reason, promise) => {
    console.error('\x1b[31m', '=== UNHANDLED REJECTION ===', '\x1b[0m');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    console.error(
      'Stack:',
      reason instanceof Error ? reason.stack : 'No stack trace',
    );
  });

  process.on('uncaughtException', (error) => {
    console.error('\x1b[31m', '=== UNCAUGHT EXCEPTION ===', '\x1b[0m');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  });

  app.use(cookieParser());

  await app.listen(6419);
}

bootstrap();
