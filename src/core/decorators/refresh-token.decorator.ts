import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Пробуем получить из разных мест
    const token: string =
      request.refreshToken ||
      request.cookies?.refreshToken ||
      request.headers['refresh-token'];

    if (!token) {
      throw DomainException.unauthorized('Refresh token not found');
    }

    return token;
  },
);
