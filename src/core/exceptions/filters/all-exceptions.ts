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
import { DomainException } from '../domain-exceptions';
import { DomainHttpExceptionsFilter } from './domain-exception.filter';

interface UnknownException {
  message?: string;
  stack?: string;
  name?: string;

  [key: string]: unknown;
}

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log('\n' + '='.repeat(80));
    console.log('📌 URL:', request.method, request.url);
    console.log('📌 Headers:', request.headers);
    console.log('📌 Body:', request.body);
    console.log('📌 Exception type:', exception?.constructor?.name);

    if (exception instanceof Error) {
      console.log('📌 Error message:', exception.message);
      console.log('📌 Stack trace:', exception.stack);
    }

    if (exception instanceof DomainException) {
      const domainFilter = new DomainHttpExceptionsFilter();
      return domainFilter.catch(exception, host);
    }

    const unknownException = exception as UnknownException;

    console.error('Unhandled exception:', {
      message: unknownException.message || 'No message',
      stack: unknownException.stack,
      url: request.url,
      name: unknownException.name,
    });

    // HttpException
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      // for ValidationPipe
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        'errorsMessages' in exceptionResponse
      ) {
        return response.status(status).json(exceptionResponse);
      }
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
