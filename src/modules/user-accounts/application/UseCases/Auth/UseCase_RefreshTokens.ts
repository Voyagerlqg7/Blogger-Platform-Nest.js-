import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../auth/payload/JwtPayload';
import { JwtService } from '@nestjs/jwt';

import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { ConfigService } from '@nestjs/config';
import { UseCase_GenerateTokens } from './UseCase_GenerateTokens';

@Injectable()
export class UseCase_RefreshTokens {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly generateTokenUseCase: UseCase_GenerateTokens,
  ) {}

  async execute(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        },
      );
      return this.generateTokenUseCase.execute(
        payload.userId,
        payload.userLogin,
      );
    } catch (e) {
      throw DomainException.unauthorized('Invalid refresh token');
    }
  }
}
