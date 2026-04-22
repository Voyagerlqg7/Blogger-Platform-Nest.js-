import { User as DomainUser } from '../entities/user layer/user/user.entity';
import { EmailConfirmationEntity } from '../entities/user layer/user/email.confirmation.entity';
import { PasswordRecoverEntity } from '../entities/user layer/user/password.recover.entity';
import { randomUUID } from 'crypto';

export class UserFactory {
  static createUser(params: {
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    isConfirmed?: boolean;
  }): DomainUser {
    const now = new Date();

    const emailConfirmation = new EmailConfirmationEntity(
      null, // confirmationCode
      null, // expiresAt
      params.isConfirmed || false,
    );

    const recoverPasswordInfo = new PasswordRecoverEntity(
      null, // code
      null, // expiresAt
    );

    return new DomainUser(
      randomUUID(), // id
      params.login,
      params.email,
      params.passwordHash,
      params.passwordSalt,
      now, // createdAt
      now, // updatedAt
      null, // deleteAt
      emailConfirmation,
      recoverPasswordInfo,
    );
  }
}
