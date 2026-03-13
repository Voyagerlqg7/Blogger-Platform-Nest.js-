import { Injectable } from '@nestjs/common';
import { EmailService } from '../../external/email.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { randomUUID } from 'crypto';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UseCase_ResendCodeConfirmation {
  constructor(
    private readonly emailService: EmailService,
    private readonly userRepository: UsersRepository,
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (
      !user ||
      !user.emailConfirmation ||
      user.emailConfirmation.isConfirmed
    ) {
      throw DomainException.validationFailed([
        new Extension(
          'User does not exist or email already confirmed',
          'email',
        ),
      ]);
    }
    const code = randomUUID();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    user.updateCodeConfirmationWithExpiresTimeForEmail(code, now);
    await this.userRepository.save(user);
    this.emailService.sendMassage(email, code).catch(console.error);
  }
}
