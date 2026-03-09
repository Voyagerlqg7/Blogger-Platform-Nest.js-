import { DomainExceptionCode } from '../domain-exceptions-codes';
import { Extension } from '../domain-exceptions';

export interface ErrorResponseBody {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: Extension[];
  code: DomainExceptionCode;
  stack?: string;
  error?: string;
  statusCode?: number;
}
