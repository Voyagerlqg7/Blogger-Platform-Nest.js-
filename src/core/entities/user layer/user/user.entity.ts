import { EmailConfirmationEntity } from './email.confirmation.entity';
import { PasswordRecoverEntity } from './password.recover.entity';
import { DomainException } from '../../../exceptions/domain-exceptions';

export class User {
  constructor(
    private readonly id: string,
    private login: string,
    private email: string,
    private passwordHash: string,
    private passwordSalt: string,
    private createdAt: Date,
    private updatedAt: Date,
    private deleteAt: Date,
    private emailConfirmation: EmailConfirmationEntity,
    private recoverPasswordInfo: PasswordRecoverEntity,
  ) {}

  makeDeleted(): void {
    this.deleteAt = new Date();
  }

  confirmEmail(code: string): void {
    if (!this.emailConfirmation) {
      throw DomainException.badRequest('Email confirmation not initialized');
    }
    if (!this.emailConfirmation.expiresAt) {
      throw DomainException.badRequest(
        'Confirmation code has no expiration date',
      );
    }

    const now = new Date();
    if (this.emailConfirmation.isConfirmed) {
      throw DomainException.badRequest('Email already confirmed');
    }
    if (now > this.emailConfirmation.expiresAt) {
      throw DomainException.badRequest('Confirmation code expired');
    }
    if (code != this.emailConfirmation.confirmationCode) {
      throw DomainException.badRequest('Code is not correct!');
    }
    this.emailConfirmation.isConfirmed = true;
  }

  updateCodeConfirmationWithExpiresTimeForEmail(
    newCode: string,
    newExpiresAt: Date,
  ): void {
    if (!this.emailConfirmation) {
      throw DomainException.badRequest('Email confirmation not initialized');
    }

    if (this.emailConfirmation.isConfirmed) {
      throw DomainException.badRequest('Email already confirmed');
    }

    this.emailConfirmation.confirmationCode = newCode;
    this.emailConfirmation.expiresAt = newExpiresAt;
  }

  updateRecoverPasswordCodeAndExpiresTime(
    newCode: string,
    newExpiresAt: Date,
  ): void {
    this.recoverPasswordInfo.code = newCode;
    this.recoverPasswordInfo.expiresAt = newExpiresAt;
  }

  updatePassword(
    code: string,
    new_passwordHash: string,
    new_passwordSalt: string,
  ): void {
    const now = new Date();
    if (!this.recoverPasswordInfo.expiresAt) {
      throw DomainException.badRequest(
        'Confirmation code has no expiration date',
      );
    }
    if (this.passwordHash == new_passwordHash) {
      DomainException.badRequest('Password is the same!');
    }
    if (now > this.recoverPasswordInfo.expiresAt) {
      DomainException.badRequest('Confirmation code expired');
    }
    if (code != this.recoverPasswordInfo.code) {
      DomainException.badRequest('Incorrect confirmation code');
    }
    this.passwordHash = new_passwordHash;
    this.passwordSalt = new_passwordSalt;
  }
}
