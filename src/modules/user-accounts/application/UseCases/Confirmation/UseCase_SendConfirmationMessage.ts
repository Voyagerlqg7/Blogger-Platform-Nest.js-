import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailService } from '../../external/email.service';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UseCase_SendConfirmationMessage {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(userId: string, email: string): Promise<void> {
    const code = randomUUID();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    const user = await this.userRepository.findOrNotFoundFail(userId);
    if (!user.emailConfirmation) {
      user.emailConfirmation = {
        confirmationCode: null,
        expiresAt: null,
        isConfirmed: false,
      };
    }
    user.updateCodeConfirmationWithExpiresTimeForEmail(code, now);
    await this.userRepository.save(user);
    this.emailService.sendMassage(email, code).catch(console.error);
  }
}
