import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensMongoRepository } from '../../../infrastructure/tokens.mongo.repository';
import { SessionRepository } from '../../../infrastructure/sessions.mongo.repository';
import { JwtPayload } from '../../auth/payload/JwtPayload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

export class LogoutCommand {
  constructor(
    public refreshToken: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class UseCase_Logout implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly tokenRepository: TokensMongoRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    // 1. Верифицируем токен
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        command.refreshToken,
        { secret: this.configService.get('JWT_REFRESH_SECRET_KEY') },
      );
    } catch (error) {
      // Токен невалидный
      throw DomainException.unauthorized('Invalid refresh token');
    }

    // 2. Проверяем соответствие deviceId
    if (payload.deviceId !== command.deviceId) {
      throw DomainException.forbidden('Device ID mismatch');
    }

    // 3. КРИТИЧНО: Проверяем, существует ли токен в базе данных
    // Если токен не найден (уже был использован при refresh), выбрасываем 401
    let tokenExists: boolean;
    try {
      await this.tokenRepository.findToken(command.refreshToken);
      tokenExists = true;
    } catch (error) {
      // Токен не найден в базе - он уже был использован или удален
      throw DomainException.unauthorized('Refresh token has been revoked');
    }

    // 4. Находим сессию
    let session;
    try {
      session = await this.sessionRepository.findByDeviceId(command.deviceId);
    } catch (error) {
      // Сессия не найдена, но токен все равно нужно удалить
      await this.tokenRepository.deleteToken(command.refreshToken);
      throw DomainException.unauthorized('Session not found');
    }

    // 5. Проверяем принадлежность сессии
    if (session.userId !== payload.userId) {
      throw DomainException.forbidden('Session belongs to another user');
    }

    // 6. Удаляем токен и сессию
    await this.tokenRepository.deleteToken(command.refreshToken);
    await this.sessionRepository.deleteDeviceById(command.deviceId);
  }
}
