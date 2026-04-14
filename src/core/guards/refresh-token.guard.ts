import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../../modules/user-accounts/application/auth/payload/JwtPayload';
import { DomainException } from '../exceptions/domain-exceptions';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('=== RefreshTokenGuard ===');
    console.log('Headers:', JSON.stringify(request.headers, null, 2));
    console.log('Cookies:', request.cookies);
    console.log('Cookie header:', request.headers.cookie);

    // 1. Получаем refresh token из cookies или headers
    const refreshToken = this.extractTokenFromRequest(request);

    console.log(
      'Extracted token:',
      refreshToken ? `${refreshToken.substring(0, 50)}...` : 'NOT FOUND',
    );

    if (!refreshToken) {
      console.log('Token not found, throwing 401');
      throw DomainException.unauthorized('Refresh token not found');
    }

    try {
      // 2. Верифицируем токен
      const payload: JwtPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        },
      );

      console.log(
        'Token verified, userId:',
        payload.userId,
        'deviceId:',
        payload.deviceId,
      );

      // 3. Добавляем данные в request
      request.refreshToken = refreshToken;
      request.user = { id: payload.userId } as any;
      request.deviceId = payload.deviceId;

      return true;
    } catch (error) {
      console.log('Token verification failed:', error.message);
      throw DomainException.unauthorized('Invalid or expired refresh token');
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Из cookies (если cookie-parser работает)
    if (request.cookies?.refreshToken) {
      console.log('Token found in request.cookies');
      return request.cookies.refreshToken;
    }

    //Ручной парсинг заголовка cookie
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      console.log('Parsing cookie header:', cookieHeader);
      const cookies = this.parseCookies(cookieHeader);
      if (cookies['refreshToken']) {
        console.log('Token found in cookie header');
        return cookies['refreshToken'];
      }
    }

    //Из заголовка Authorization
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      console.log('Token found in Authorization header');
      return authHeader.substring(7);
    }

    console.log('Token not found in any source');
    return undefined;
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    const items = cookieHeader.split(';');

    for (const item of items) {
      const [key, value] = item.trim().split('=');
      if (key && value) {
        cookies[key] = value;
      }
    }

    return cookies;
  }
}
