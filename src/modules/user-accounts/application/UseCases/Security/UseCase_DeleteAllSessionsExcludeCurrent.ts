import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { TokensMongoRepository } from '../../../infrastructure/tokens.mongo.repository';
import { SessionRepository } from '../../../infrastructure/sessions.mongo.repository';

export class DeleteAllDevicesCommand {
  constructor(
    public refreshToken: string,
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllDevicesCommand)
export class UseCase_DeleteAllDevices
  implements ICommandHandler<DeleteAllDevicesCommand, void>
{
  constructor(
    private readonly tokenRepository: TokensMongoRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DeleteAllDevicesCommand): Promise<void> {
    let tokenExists;
    try {
      tokenExists = await this.tokenRepository.findToken(command.refreshToken);
    } catch (error) {
      throw DomainException.unauthorized('Token not found or revoked');
    }

    if (!tokenExists) {
      throw DomainException.unauthorized('Token not found or revoked');
    }

    let currentSession;
    try {
      currentSession = await this.sessionRepository.findByDeviceId(
        command.deviceId,
      );
    } catch (error) {
      throw DomainException.unauthorized('Session not found');
    }
    if (currentSession.sessionExpiresAt < new Date()) {
      await this.tokenRepository.deleteToken(command.refreshToken);
      throw DomainException.unauthorized('Session expired');
    }
    if (currentSession.userId !== command.userId) {
      throw DomainException.forbidden('Session belongs to another user');
    }

    await this.sessionRepository.deleteAllDevicesExceptOne(
      command.userId,
      command.deviceId,
    );
    await this.tokenRepository.deleteAllTokensExceptOne(command.refreshToken);
  }
}
