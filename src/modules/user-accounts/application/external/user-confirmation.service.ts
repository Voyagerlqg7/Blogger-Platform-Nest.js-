import { EmailService } from './email.service';
import { PasswordService } from './password.service';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../infrastructure/users.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UserConfirmationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly passwordService: PasswordService,
    private readonly userRepository: UsersRepository,
  ) {}

  async sendConfirmationMessage(
    userId: string,
    email: string,
  ): Promise<boolean> {
    const code = randomUUID();
    const now = new Date();
    now.setSeconds(now.getMinutes() + 60);
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
    return this.emailService.sendMassage(email, code);
  }

  async sendRecoverPasswordCode(email: string): Promise<void> {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (!user) {
      throw DomainException.badRequest('Cannot send recover password code!');
    }
    const code = randomUUID();
    const now = new Date();
    now.setSeconds(now.getSeconds() + 10);
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

  async resendCodeConfirmation(email: string): Promise<boolean> {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (
      !user ||
      !user.emailConfirmation ||
      user.emailConfirmation.isConfirmed
    ) {
      throw DomainException.badRequest(
        'Cannot resend confirmation code',
        'email',
        [
          new Extension(
            'User does not exist or email already confirmed',
            'email',
          ),
        ],
      );
    }
    const code = randomUUID();
    const now = new Date();
    now.setSeconds(now.getSeconds() + 10);
    user.updateCodeConfirmationWithExpiresTimeForEmail(code, now);
    await this.userRepository.save(user);
    const emailSent = await this.emailService.sendMassage(email, code);
    if (!emailSent) {
      console.error(`Failed to send email to ${email}`);
    }
    return emailSent;
  }

  async checkCodeConfirmation(code: string): Promise<boolean> {
    const user = await this.userRepository.findByCodeConfirmation(code);
    if (!user) {
      throw DomainException.badRequest('Cannot send code confirmation!');
    }
    user.confirmEmail(code);
    await this.userRepository.save(user);
    return true;
  }

  async checkCodeRecoverPassword(
    code: string,
    new_password: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findByRecoverPasswordCode(code);
    if (!user) {
      throw DomainException.badRequest('Cannot check recover password code!');
    }
    const salt: string = await this.passwordService.generatePasswordSalt();
    const hash: string = await this.passwordService.generateHash(
      new_password,
      salt,
    );
    user.updatePassword(code, hash, salt);
    await this.userRepository.save(user);
    return true;
  }
}
