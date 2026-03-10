import { EmailService } from './email.service';
import { PasswordService } from './password.service';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

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
    now.setSeconds(now.getSeconds() + 10);
    const user = await this.userRepository.findOrNotFoundFail(userId);
    user.updateCodeConfirmationWithExpiresTimeForEmail(code, now);
    await this.userRepository.save(user);
    return await this.emailService.sendMassage(email, code);
  }

  async sendRecoverPasswordCode(email: string): Promise<void> {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (user == null) {
      DomainException.badRequest('Cannot send recover password code!');
    } else {
      const code = randomUUID();
      const now = new Date();
      now.setSeconds(now.getSeconds() + 10);
      user.updateRecoverPasswordCodeAndExpiresTime(code, now);
      await this.userRepository.save(user);
      await this.emailService.sendPasswordReset(email, code);
    }
  }

  async resendCodeConfirmation(email: string): Promise<boolean> {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (user == null) {
      DomainException.badRequest('Cannot send code confirmation!');
      return false;
    }
    const code = randomUUID();
    const now = new Date();
    now.setSeconds(now.getSeconds() + 10);
    user.updateCodeConfirmationWithExpiresTimeForEmail(code, now);
    await this.userRepository.save(user);
    return await this.emailService.sendMassage(email, code);
  }

  async checkCodeConfirmation(code: string): Promise<boolean> {
    const user = await this.userRepository.findByCodeConfirmation(code);
    if (user == null) {
      DomainException.badRequest('Cannot send code confirmation!');
      return false;
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
    if (user == null) {
      DomainException.badRequest('Cannot check recover password code!');
      return false;
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
