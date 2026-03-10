import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    //ValidationPipe?
    if (
      typeof exceptionResponse === 'object' &&
      'errorsMessages' in exceptionResponse
    ) {
      return response.status(400).json(exceptionResponse);
    }

    response.status(400).json({
      errorsMessages: [
        {
          message: exception.message,
          field: 'unknown',
        },
      ],
    });
  }
}
