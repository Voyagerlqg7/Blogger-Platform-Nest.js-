import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DomainException } from '../exceptions/domain-exceptions';
import { UsersRepository } from '../../modules/user-accounts/infrastructure/users.repository';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw DomainException.unauthorized('Invalid token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });

      const user = await this.usersRepository.findById(
        payload.userId || payload.sub,
      );

      if (!user) {
        throw DomainException.unauthorized('User not found');
      }

      request.user = user;

      return true;
    } catch {
      throw DomainException.unauthorized('Invalid access token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
