import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { TokensMongoRepository } from '../../../infrastructure/tokens.mongo.repository';
import { SessionRepository } from '../../../infrastructure/sessions.mongo.repository';

export class DeleteDeviceCommand {
  constructor(
    public refreshToken: string,
    public deviceIdToDelete: string,
    public userId: string,
    public currentDeviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class UseCase_DeleteDevice
  implements ICommandHandler<DeleteDeviceCommand, void>
{
  constructor(
    private readonly tokenRepository: TokensMongoRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DeleteDeviceCommand): Promise<void> {
    // 1. Проверяем существование токена в БД (не revoked)
    try {
      await this.tokenRepository.findToken(command.refreshToken);
    } catch (error) {
      throw DomainException.unauthorized('Token not found or revoked');
    }

    // 2. Находим текущую сессию (по deviceId из токена)
    let currentSession;
    try {
      currentSession = await this.sessionRepository.findByDeviceId(
        command.currentDeviceId,
      );
    } catch (error) {
      throw DomainException.unauthorized('Current session not found');
    }

    // 3. Проверяем, что текущая сессия не истекла
    if (currentSession.sessionExpiresAt < new Date()) {
      await this.tokenRepository.deleteToken(command.refreshToken);
      throw DomainException.unauthorized('Current session expired');
    }

    // 4. Проверяем, что текущая сессия принадлежит пользователю
    if (currentSession.userId !== command.userId) {
      throw DomainException.forbidden('Session belongs to another user');
    }

    // 5. Находим сессию, которую хотим удалить
    let sessionToDelete;
    try {
      sessionToDelete = await this.sessionRepository.findByDeviceId(
        command.deviceIdToDelete,
      );
    } catch (error) {
      throw DomainException.notFound('Session', command.deviceIdToDelete);
    }

    // 6. Проверяем, что удаляемая сессия принадлежит тому же пользователю
    if (sessionToDelete.userId !== command.userId) {
      throw DomainException.forbidden('Cannot delete session of another user');
    }

    // 7. Проверяем, что не удаляем текущую сессию (опционально)
    if (command.currentDeviceId === command.deviceIdToDelete) {
      throw DomainException.forbidden('Cannot delete current session');
    }

    // 8. Удаляем сессию
    await this.sessionRepository.deleteDeviceById(command.deviceIdToDelete);
  }
}
