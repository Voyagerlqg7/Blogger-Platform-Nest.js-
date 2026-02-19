import { EmailService } from './email.service';
import { UsersService } from '../users.service';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';


//TODO: finish confirmation service
@Injectable()
export class UserConfirmationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
  ) {}
  async sendConfirmationMessage(userId: string, email: string): Promise<boolean> {
    const code = randomUUID();
    const now = new Date();
    now.setSeconds(now.getSeconds() + 10);

    const expiresAt = now.toISOString();

    //await this.userService.updateCodeConfirmationAndExpiresTime(id, code, expiresAt);
    return await this.emailService.sendMassage(email, code);
  }
  async sendRecoverPasswordCode(email: string): Promise<void> {
    const user = await this.userService.findByLoginOrEmail(email);

    if (user) {
      const code = uuidv4();
      const expiresAt = add(new Date(), { minutes: 15 }).toISOString();
      await this.userService.updateRecoverPasswordCodeAndExpiresTime(user.id, code, expiresAt);
      await this.emailService.sendPasswordReset(email, code);
    }
  }


  async resendCodeConfirmation(email: string): Promise<boolean> {
    const user = await this.userService.findByLoginOrEmail(email);

    if (!user || user.isConfirmed) {
      return false;
    }

    const newCode = uuidv4();
    const newExpiresAt = add(new Date(), { seconds: 10 }).toISOString();

    await this.userService.updateCodeConfirmationAndExpiresTime(user.id, newCode, newExpiresAt);
    return await this.emailService.sendEmail(email, newCode);
  }

  async checkCodeConfirmation(code: string): Promise<boolean | undefined> {
    const user = await this.userService.findByCodeConfirmation(code);
    if (!user) return undefined;

    const isExpired = !user.expiresAt || new Date() > new Date(user.expiresAt);
    const isConfirmed = user.isConfirmed;

    if (isConfirmed || isExpired) return false;

    await this.userService.updateStatusConfirmation(user);
    return true;
  }
  async checkCodeRecoverPassword(code: string): Promise<boolean | undefined> {
    const user = await this.userService.findUserByRecoverPasswordCode(code);
    if (!user) return undefined;

    if (!user.recoverPasswordExpiresAt) return false;

    const isExpired = new Date() > new Date(user.recoverPasswordExpiresAt);
    if (isExpired) return false; // Код истек

    return true;
  }

}
