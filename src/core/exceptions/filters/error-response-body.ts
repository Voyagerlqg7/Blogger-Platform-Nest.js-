import { Extension } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exceptions-codes';

export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: Extension[];
  code: DomainExceptionCode;
};
