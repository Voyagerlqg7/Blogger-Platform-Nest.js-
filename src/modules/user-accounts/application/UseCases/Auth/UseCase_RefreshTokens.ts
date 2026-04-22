import { JwtPayload } from '../../auth/payload/JwtPayload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { GenerateTokensCommand } from './UseCase_GenerateTokens';
import { TokensMongoRepository } from '../../../infrastructure/tokens.mongo.repository';
import { SessionRepository } from '../../../infrastructure/sessions.mongo.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

export class RefreshTokensCommand {
  constructor(public oldRefreshToken: string) {} // Убрал нижнее подчеркивание
}

@CommandHandler(RefreshTokensCommand)
export class UseCase_RefreshTokens
  implements
    ICommandHandler<
      RefreshTokensCommand,
      { accessToken: string; refreshToken: string }
    >
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokensMongoRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(
    command: RefreshTokensCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        command.oldRefreshToken,
        { secret: this.configService.get('JWT_REFRESH_SECRET_KEY') },
      );
    } catch (error) {
      throw DomainException.unauthorized('Invalid or expired refresh token');
    }

    try {
      const tokenDoc = await this.tokenRepository.findToken(
        command.oldRefreshToken,
      );
    } catch (error) {
      throw DomainException.unauthorized('Refresh token not found');
    }

    let session;
    try {
      session = await this.sessionRepository.findByDeviceId(payload.deviceId);
    } catch (error) {
      throw DomainException.unauthorized('Session not found');
    }

    if (session.sessionExpiresAt < new Date()) {
      await this.tokenRepository.deleteToken(command.oldRefreshToken);
      throw DomainException.unauthorized('Session expired');
    }

    if (session.userId !== payload.userId) {
      throw DomainException.unauthorized('Invalid session owner');
    }

    await this.tokenRepository.deleteToken(command.oldRefreshToken);

    session.updateActivityForDevice(20_000);
    await this.sessionRepository.save(session);

    const tokens = await this.commandBus.execute(
      new GenerateTokensCommand(payload.userId, payload.deviceId),
    );

    return tokens;
  }
}
