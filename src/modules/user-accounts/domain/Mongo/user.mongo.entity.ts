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

  makeDeleted(): void {
    this.deletedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<User> & {
  createInstance(dto: CreateUserDomainDto): UserDocument;
};
