import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../auth/payload/JwtPayload';

@Injectable()
export class UseCase_GenerateTokens {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(userId: string, login: string) {
    const payload: JwtPayload = {
      userId: userId,
      userLogin: login,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET_KEY'),
      expiresIn: '5m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
