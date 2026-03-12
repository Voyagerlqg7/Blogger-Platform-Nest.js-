import { DomainExceptionCode } from './domain-exceptions-codes';

export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  message: string;
  field?: string;
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    field?: string;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.field = errorInfo.field;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }

  static notFound(entity: string, field?: string) {
    return new DomainException({
      code: DomainExceptionCode.NotFound,
      message: `${entity} not found`,
      field: `${field} not found`,
    });
  }

  static badRequest(message: string, field?: string, extensions?: Extension[]) {
    return new DomainException({
      code: DomainExceptionCode.BadRequest,
      message: message,
      field: field,
      extensions,
    });
  }

  static unauthorized(message: string = 'Unauthorized', field?: string) {
    return new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: message,
      field: field,
    });
  }

  static forbidden(message: string = 'Forbidden', field?: string) {
    return new DomainException({
      code: DomainExceptionCode.Forbidden,
      message: message,
      field: field,
    });
  }

  static validationFailed(errors: Extension[]) {
    return new DomainException({
      code: DomainExceptionCode.ValidationFailed,
      message: 'Validation failed',
      extensions: errors,
    });
  }
  static validationFieldError(message: string, field?: string) {
    return new DomainException({
      code: DomainExceptionCode.ValidationError,
      message: message,
      field: field,
    });
  }
}
