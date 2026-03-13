import { Injectable } from '@nestjs/common';
import { EmailService } from '../../external/email.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UseCase_SendRecoverPasswordCode {
  constructor(
    private readonly emailService: EmailService,
    private readonly userRepository: UsersRepository,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (!user) {
      throw DomainException.badRequest('Cannot send recover password code!');
    }
    const code = randomUUID();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    if (!user.recoverPasswordInfo) {
      user.recoverPasswordInfo = {
        code: null,
        expiresAt: null,
      };
    }
    user.updateRecoverPasswordCodeAndExpiresTime(code, now);
    await this.userRepository.save(user);
    await this.emailService.sendPasswordReset(email, code);
  }
}
