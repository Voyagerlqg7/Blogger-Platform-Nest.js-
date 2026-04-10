import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { JwtPayload } from '../../auth/payload/JwtPayload';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokensRepository } from '../../../infrastructure/tokens.repository';
import { SessionRepository } from '../../../infrastructure/sessions.repository';

export class DeleteDeviceCommand {
  constructor(
    public refreshToken: string, // Убрал нижнее подчеркивание
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand) // Изменено на CommandHandler
export class UseCase_DeleteDevice
  implements ICommandHandler<DeleteDeviceCommand, void>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokensRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DeleteDeviceCommand): Promise<void> {
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

    const session = await this.sessionRepository.findByDeviceId(
      payload.deviceId,
    );

    if (session.sessionExpiresAt && session.sessionExpiresAt < new Date()) {
      await this.tokenRepository.deleteToken(command.refreshToken);
      throw DomainException.unauthorized('Session expired');
    }

    if (session.userId !== command.userId) {
      throw DomainException.forbidden('Session belongs to another user');
    }

    if (payload.deviceId !== command.deviceId) {
      throw DomainException.forbidden('Cannot delete another device');
    }

    // 7. Проверяем, что пользователь не пытается удалить текущую сессию (опционально)
    if (payload.deviceId === command.deviceId) {
      // Можно разрешить или запретить удаление своей сессии
      // Обычно разрешают, но тогда нужно будет разлогинить текущего пользователя
    }
    await this.sessionRepository.deleteDeviceById(command.deviceId);
    await this.tokenRepository.deleteToken(command.refreshToken);
  }
}
