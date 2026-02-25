import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateUserDto } from '../dto/create-user.dto';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { Name, NameSchema } from './name.schema';
import {
  EmailConfirmationSchema,
  EmailConfirmation,
} from './email-confirmation.valueObject';
import {
  RecoverPasswordInfo,
  RecoverPasswordInfoSchema,
} from './recover-password.valueObject';

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
  @Prop({ type: Boolean, required: true, default: false })
  isEmailConfirmed: boolean;
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
      email: dto.email,
      passwordHash: dto.passwordHash,
      login: dto.login,
      isEmailConfirmed: false,
      /*user.name = {
                              firstName: 'firstName xxx',
                              lastName: 'lastName yyy',
                            };
                        */
    });
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  makeDeleted() {
    this.deletedAt = new Date();
  }

  /**
   * Updates the user instance with new data
   * Resets email confirmation if email is updated
   * @param {UpdateUserDto} dto - The data transfer object for user updates
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.isEmailConfirmed = false;
    }
    this.email = dto.email;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
