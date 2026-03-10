import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { Name, NameSchema } from './schemas/name.schema';
import {
  EmailConfirmationSchema,
  EmailConfirmation,
} from './schemas/email-confirmation.schema';
import {
  RecoverPasswordInfo,
  RecoverPasswordInfoSchema,
} from './schemas/recover-password.schema';
import { DomainException } from '../../../core/exceptions/domain-exceptions';

/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
// timestamps auto create createdAt & updateAt
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
  // @Prop(NameSchema) this variant from doc. doesn't make validation for inner object
  @Prop({ type: NameSchema })
  name: Name;
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  @Prop({ type: EmailConfirmationSchema, required: false })
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
      this.emailConfirmation = {
        confirmationCode: null,
        expiresAt: null,
        isConfirmed: false,
      };
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
