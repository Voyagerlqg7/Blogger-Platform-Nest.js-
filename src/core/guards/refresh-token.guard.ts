import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DomainException } from '../exceptions/domain-exceptions';
import { JwtPayload } from '../../modules/user-accounts/application/auth/payload/JwtPayload';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Получаем refresh token из cookies или headers
    const refreshToken = this.extractTokenFromRequest(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // 2. Верифицируем токен
      const payload: JwtPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        },
      );

      // 3. Добавляем данные в request
      request.refreshToken = refreshToken;
      request.user = { id: payload.userId } as any; // или полный UserViewDto
      request.deviceId = payload.deviceId;

      return true;
    } catch (error) {
      throw DomainException.unauthorized('Refresh token not found GUARD');
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Вариант 1: Из cookies
    return request.cookies?.refreshToken;

    // Вариант 2: Из заголовка Authorization
    // const authHeader = request.headers.authorization;
    // if (authHeader?.startsWith('Bearer ')) {
    //   return authHeader.substring(7);
    // }
  }
}
