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
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapToHttpStatus(exception.code);
    const responseBody = this.buildResponseBody(exception, request);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      // 4xx Client Errors
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;

      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.Unauthorized:
      case DomainExceptionCode.InvalidCredentials:
        return HttpStatus.UNAUTHORIZED;

      // 5xx Server Errors
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
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
