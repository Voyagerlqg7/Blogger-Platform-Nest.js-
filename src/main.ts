import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors
          .filter((error) => !error.constraints?.whitelistValidation)
          .map((error) => {
            let message = '';
            if (error.constraints?.isNotEmpty) {
              message = `${error.property} is required`;
            } else if (error.constraints?.isString) {
              message = `${error.property} must be a string`;
            } else if (error.constraints?.maxLength) {
              message = `${error.property} must be shorter than or equal to ${error.constraints.maxLength.match(/\d+/)} characters`;
            } else if (error.constraints?.isUrl) {
              message = `${error.property} must be a valid URL`;
            } else {
              message = Object.values(error.constraints || {})[0];
            }

            return {
              message,
              field: error.property,
            };
          });

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
  await app.listen(6419);
}

bootstrap();
