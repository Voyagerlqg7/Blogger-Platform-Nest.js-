import { DomainExceptionCode } from './domain-exceptions-codes';

export class Extension {
  constructor(
    public message: string,
    public key: string,
  ) {}
}

export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }

  static notFound(entity: string) {
    return new DomainException({
      code: DomainExceptionCode.NotFound,
      message: `${entity} not found`,
    });
  }

  static badRequest(message: string, extensions?: Extension[]) {
    return new DomainException({
      code: DomainExceptionCode.BadRequest,
      message,
      extensions,
    });
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message,
    });
  }

  static forbidden(message: string = 'Forbidden') {
    return new DomainException({
      code: DomainExceptionCode.Forbidden,
      message,
    });
  }

  static validationError(message: string, extensions: Extension[]) {
    return new DomainException({
      code: DomainExceptionCode.ValidationError,
      message,
      extensions,
    });
  }
}
