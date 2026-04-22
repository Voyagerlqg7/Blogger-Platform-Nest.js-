import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from '../dto/create-user.domain.dto';
import { Name, NameMongoSchema } from './schemas/name.mongo.schema';
import {
  EmailConfirmationMongoSchema,
  EmailConfirmation,
} from './schemas/email-confirmation.mongo.schema';
import {
  RecoverPasswordInfo,
  RecoverPasswordInfoSchema,
} from './schemas/recover-password.mongo.schema';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, required: true })
  passwordHash: string;
  @Prop({ type: String, required: true })
  passwordSalt: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: NameMongoSchema })
  name: Name;
  createdAt: Date;
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  @Prop({ type: EmailConfirmationMongoSchema, required: false })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: RecoverPasswordInfoSchema, required: false })
  recoverPasswordInfo: RecoverPasswordInfo;

  static createInstance(
    this: UserModelType,
    dto: CreateUserDomainDto,
  ): UserDocument {
    const user = new this({
      login: dto.login,
      email: dto.email,
      passwordHash: dto.passwordHash,
      passwordSalt: dto.passwordSalt,
    });

    user.emailConfirmation = {
      confirmationCode: null,
      expiresAt: null,
      isConfirmed: dto.isConfirmed,
    };

    return user;
  }

  makeDeleted(): void {
    this.deletedAt = new Date();
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

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<User> & {
  createInstance(dto: CreateUserDomainDto): UserDocument;
};
