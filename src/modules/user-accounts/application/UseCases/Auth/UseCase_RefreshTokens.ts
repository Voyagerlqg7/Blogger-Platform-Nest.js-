import { JwtPayload } from '../../auth/payload/JwtPayload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { GenerateTokensCommand } from './UseCase_GenerateTokens';
import { TokensRepository } from '../../../infrastructure/tokens.repository';
import { SessionRepository } from '../../../infrastructure/sessions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { AST } from 'eslint';
import TokenType = AST.TokenType;

export class RefreshTokensCommand {
  constructor(public _OldRefreshToken: string) {}
}

@CommandHandler(RefreshTokensCommand)
export class UseCase_RefreshTokens
  implements
    ICommandHandler<
      RefreshTokensCommand,
      {
        accessToken: string;
        refreshToken: string;
      }
    >
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokensRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        command._OldRefreshToken,
        { secret: this.configService.get('JWT_REFRESH_SECRET_KEY') },
      );

      await this.tokenRepository.findToken(command._OldRefreshToken);
      // 3. Находим сессию
      const session = await this.sessionRepository.findByDeviceId(
        payload.deviceId,
      );

      // 4. Проверяем, что сессия активна
      if (session.sessionExpiresAt < new Date()) {
        await this.tokenRepository.deleteToken(command._OldRefreshToken);
        throw DomainException.unauthorized('Session expired');
      }

      // 5. Удаляем СТАРЫЙ refresh token (только после всех проверок)
      await this.tokenRepository.deleteToken(command._OldRefreshToken);

      // 6. Обновляем активность сессии
      session.updateActivityForDevice(20_000); // TTL в миллисекундах
      await this.sessionRepository.save(session);

      // 7. Генерируем НОВЫЕ токены
      const tokens: TokenType = await this.commandBus.execute(
        new GenerateTokensCommand(payload.userId, payload.deviceId),
      );
      return tokens;
    } catch (error) {
      //(security first)
      await this.tokenRepository.deleteToken(command._OldRefreshToken);
      return error;
    }
  }
}
