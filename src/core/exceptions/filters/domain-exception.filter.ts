import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainExceptionCode } from '../domain-exceptions-codes';
import { ErrorResponseBody } from './error-response-body';
import { Request, Response } from 'express';
import { DomainException } from '../domain-exceptions';

@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.code === DomainExceptionCode.ValidationFailed) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        errorsMessages: exception.extensions.map((ext) => ({
          message: ext.message,
          field: ext.field,
        })),
      });
    }

    const status = this.mapToHttpStatus(exception.code);
    const responseBody = this.buildResponseBody(exception, request);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      // 4xx Client Errors
      case DomainExceptionCode.NotFound: // 1 - Resource not found
        return HttpStatus.NOT_FOUND; // 404 Not Found

      case DomainExceptionCode.BadRequest: // 2 - Bad request
      case DomainExceptionCode.ValidationError: // 5 - Validation failed
      case DomainExceptionCode.ConfirmationCodeExpired: // 13 - Confirmation code expired
      case DomainExceptionCode.EmailNotConfirmed: // 12 - Email not confirmed
      case DomainExceptionCode.PasswordRecoveryCodeExpired: // 14 - Password recovery code expired
        return HttpStatus.BAD_REQUEST; // 400 Bad Request

      case DomainExceptionCode.Forbidden: // 4 - Access denied
        return HttpStatus.FORBIDDEN; // 403 Forbidden

      case DomainExceptionCode.Unauthorized: // 11 - Not authenticated
      case DomainExceptionCode.InvalidCredentials: // 16 - Invalid credentials
        return HttpStatus.UNAUTHORIZED; // 401 Unauthorized

      // 5xx Server Errors
      case DomainExceptionCode.InternalServerError: // 3 - Internal server error
        return HttpStatus.INTERNAL_SERVER_ERROR; // 500 Internal Server Error

      default:
        // Unknown error code - default to 500 Internal Server Error
        return HttpStatus.INTERNAL_SERVER_ERROR; // 500 Internal Server Error
    }
  }

  private buildResponseBody(
    exception: DomainException,
    request: Request,
  ): ErrorResponseBody {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    const baseBody: ErrorResponseBody = {
      timestamp: new Date().toISOString(),
      message: exception.message,
      code: exception.code,
      extensions: exception.extensions,
      path: null,
    };

    if (isDevelopment) {
      return {
        ...baseBody,
        path: request.url,
        stack: exception.stack,
        error: 'Domain Error',
        statusCode: this.mapToHttpStatus(exception.code),
      };
    }

    return baseBody;
  }
}
