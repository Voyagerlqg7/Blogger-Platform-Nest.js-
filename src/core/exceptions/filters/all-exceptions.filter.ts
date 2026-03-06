import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ErrorResponseBody } from './error-response-body';
import { DomainExceptionCode } from '../domain-exceptions-codes';

interface ValidationErrorResponse {
  errors?: Array<{ message: string; key: string }>;
  message?: string | string[];
}

interface Extension {
  message: string;
  key: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status: number;
    let responseBody: ErrorResponseBody;

    // 1. HttpException from NestJS (include BadRequestException from class-validator)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message = exception.message;
      let extensions: Extension[] = [];

      if (exception instanceof BadRequestException) {
        const validationResult = this.handleValidationError(exceptionResponse);
        extensions = validationResult.extensions;
        message = validationResult.message;
      }

      responseBody = this.buildResponseBody(
        request.url,
        message,
        this.mapHttpStatusToDomainCode(status, exception),
        extensions,
      );
    }

    // 2. Mongoose CastError (invalid ObjectId)
    else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      responseBody = this.buildResponseBody(
        request.url,
        `Invalid ${exception.path}: ${exception.value}`,
        DomainExceptionCode.BadRequest,
        [
          {
            message: `Invalid ${exception.path} format`,
            key: exception.path,
          },
        ],
      );
    }

    // 3. Mongoose ValidationError (required fields etc.)
    else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      const extensions = Object.values(exception.errors).map((err) => ({
        message: err.message,
        key: err.path,
      }));

      responseBody = this.buildResponseBody(
        request.url,
        exception.message,
        DomainExceptionCode.ValidationError,
        extensions,
      );
    }

    // 4. All other exceptions
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      const error = exception as Error;
      const message = error.message || 'Unknown exception occurred.';

      responseBody = this.buildResponseBody(
        request.url,
        message,
        DomainExceptionCode.InternalServerError,
        [],
      );

      if (process.env.NODE_ENV !== 'production' && error.stack) {
        responseBody.stack = error.stack;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error({
        status,
        ...responseBody,
        exception,
      });
    }

    response.status(status).json(responseBody);
  }

  private handleValidationError(exceptionResponse: unknown): {
    extensions: Extension[];
    message: string;
  } {
    const responseObj = exceptionResponse as ValidationErrorResponse;

    if (responseObj.errors && Array.isArray(responseObj.errors)) {
      return {
        extensions: responseObj.errors.map((err) => ({
          message: err.message,
          key: err.key,
        })),
        message: 'Validation failed',
      };
    }

    if (responseObj.message && Array.isArray(responseObj.message)) {
      const extensions = responseObj.message.map((msg: string) => {
        const fieldMatch = msg.match(/^([a-zA-Z]+) /);
        const field = fieldMatch ? fieldMatch[1] : 'unknown';
        return { message: msg, key: field };
      });

      return {
        extensions,
        message: 'Validation failed',
      };
    }
    return {
      extensions: [],
      message:
        typeof responseObj.message === 'string'
          ? responseObj.message
          : 'Validation failed',
    };
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
    code: DomainExceptionCode,
    extensions: Extension[],
  ): ErrorResponseBody {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      timestamp: new Date().toISOString(),
      path: isProduction ? null : requestUrl,
      message:
        isProduction && code === DomainExceptionCode.InternalServerError
          ? 'Some error occurred'
          : message,
      extensions,
      code,
    };
  }

  private mapHttpStatusToDomainCode(
    status: number,
    exception: HttpException,
  ): DomainExceptionCode {
    if (exception instanceof UnauthorizedException) {
      return DomainExceptionCode.Unauthorized;
    }
    if (exception instanceof ForbiddenException) {
      return DomainExceptionCode.Forbidden;
    }
    if (exception instanceof NotFoundException) {
      return DomainExceptionCode.NotFound;
    }
    if (exception instanceof BadRequestException) {
      return DomainExceptionCode.BadRequest;
    }

    switch (status) {
      case 400:
        return DomainExceptionCode.BadRequest;
      case 401:
        return DomainExceptionCode.Unauthorized;
      case 403:
        return DomainExceptionCode.Forbidden;
      case 404:
        return DomainExceptionCode.NotFound;
      default:
        return DomainExceptionCode.InternalServerError;
    }
  }
}
