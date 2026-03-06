import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exceptions-codes';
import { Error as MongooseError } from 'mongoose';
import { Extension } from '../../../core/exceptions/domain-exceptions';

function isMongooseValidationError(
  error: unknown,
): error is MongooseError.ValidationError {
  return error instanceof MongooseError.ValidationError;
}

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument): Promise<UserDocument> {
    try {
      return await user.save();
    } catch (error) {
      if (isMongooseValidationError(error)) {
        const extensions: Extension[] = Object.values(error.errors).map(
          (err) => ({
            message: err.message,
            key: err.path,
          }),
        );

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: error.message,
          extensions,
        });
      }
      throw error;
    }
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw DomainException.notFound('User');
    }
    return user;
  }

  async getPasswordHash(loginOrEmail: string): Promise<string> {
    const user = await this.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw DomainException.notFound('User');
    }
    return user.passwordHash;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) {
      throw DomainException.notFound('User');
    }
    return user;
  }

  async findByCodeConfirmation(
    confirmation_code: string,
  ): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.code': confirmation_code,
    });
    if (!user) {
      throw DomainException.notFound('User');
    }
    return user;
  }

  async findByRecoverPasswordCode(recover_code: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'recoverPasswordInfo.code': recover_code,
    });
    if (!user) {
      throw DomainException.notFound('User');
    }
    return user;
  }
}
