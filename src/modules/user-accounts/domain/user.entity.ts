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

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: RecoverPasswordInfoSchema, required: false })
  recoverPasswordInfo: RecoverPasswordInfo;

  static createInstance(
    this: UserModelType,
    dto: CreateUserDomainDto,
  ): UserDocument {
    return new this({
      login: dto.login,
      email: dto.email,
      passwordHash: dto.passwordHash,
      passwordSalt: dto.passwordSalt,
    });
  }

  makeDeleted(): void {
    this.deletedAt = new Date();
  }

  confirmEmail(currentDate: Date): void {
    if (this.emailConfirmation.isConfirmed) {
      throw new Error('Email already confirmed');
    }
    if (currentDate > this.emailConfirmation.expiresAt) {
      throw new Error('Confirmation code expired');
    }
    this.emailConfirmation.isConfirmed = true;
  }

  updateCodeConfirmationWithExpiresTime(
    newCode: string,
    newExpiresAt: Date,
  ): void {
    //TODO: replace to exception filter soon
    if (this.emailConfirmation.isConfirmed) {
      throw new Error('Email already confirmed');
    }
    this.emailConfirmation.confirmationCode = newCode;
    this.emailConfirmation.expiresAt = newExpiresAt;
    this.emailConfirmation.isConfirmed = false; //still not confirmed
  }

  updatePassword(new_passwordHash: string, new_passwordSalt: string): void {
    if (this.passwordHash == new_passwordHash) {
      throw new Error('Password is the same!');
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
