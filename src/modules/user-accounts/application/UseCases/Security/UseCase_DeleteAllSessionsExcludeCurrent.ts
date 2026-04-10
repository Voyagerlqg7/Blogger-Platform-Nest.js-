import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../auth/payload/JwtPayload';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { TokensRepository } from '../../../infrastructure/tokens.repository';
import { SessionRepository } from '../../../infrastructure/sessions.repository';

export class DeleteAllDevicesCommand {
  constructor(
    public refreshToken: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteAllDevicesCommand)
export class UseCase_DeleteAllDevices
  implements ICommandHandler<DeleteAllDevicesCommand, void>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokensRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DeleteAllDevicesCommand): Promise<void> {
    // 1. Верифицируем refresh токен
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        command.refreshToken,
        { secret: this.configService.get('JWT_REFRESH_SECRET_KEY') },
      );
    } catch (error) {
      throw DomainException.unauthorized('Invalid refresh token');
    }

    const tokenExists = await this.tokenRepository.findToken(
      command.refreshToken,
    );
    if (!tokenExists) {
      throw DomainException.unauthorized('Token not found or revoked');
    }

    // 3. Находим текущую сессию по deviceId из токена
    const currentSession = await this.sessionRepository.findByDeviceId(
      payload.deviceId,
    );

    // 4. Проверяем, что сессия не истекла
    if (
      currentSession.sessionExpiresAt &&
      currentSession.sessionExpiresAt < new Date()
    ) {
      await this.tokenRepository.deleteToken(command.refreshToken);
      throw DomainException.unauthorized('Session expired');
    }

    // 5. Проверяем, что сессия принадлежит текущему пользователю
    if (currentSession.userId !== command.userId) {
      throw DomainException.forbidden('Session belongs to another user');
    }

    // 6. Удаляем ВСЕ сессии пользователя, КРОМЕ текущей
    await this.sessionRepository.deleteAllDevicesExceptOne(
      command.userId,
      payload.deviceId,
    );
    await this.tokenRepository.deleteAllTokensExceptOne(command.refreshToken);
  }
}
