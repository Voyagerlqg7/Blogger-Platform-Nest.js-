import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from './error-response-body';
import { DomainExceptionCode } from '../domain-exceptions-codes';

interface UnknownException {
  message?: string;
  stack?: string;
  name?: string;

  [key: string]: unknown;
}

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const unknownException = exception as UnknownException;

    console.error('Unhandled exception:', {
      message: unknownException.message || 'No message',
      stack: unknownException.stack,
      url: request.url,
      name: unknownException.name,
    });

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    const responseBody = this.buildResponseBody(
      unknownException,
      request.url,
      status,
    );

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    exception: UnknownException,
    requestUrl: string,
    status: number,
  ): ErrorResponseBody {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    const baseBody: ErrorResponseBody = {
      timestamp: new Date().toISOString(),
      message: isDevelopment
        ? exception.message || 'Internal server error'
        : 'Internal server error',
      code: DomainExceptionCode.InternalServerError,
      extensions: [],
      path: null,
    };

    if (isDevelopment) {
      return {
        ...baseBody,
        path: requestUrl,
        stack: exception.stack,
        error: exception.name || 'Internal Server Error',
        statusCode: status,
      };
    }

    return {
      ...baseBody,
      path: null,
    };
  }
}
