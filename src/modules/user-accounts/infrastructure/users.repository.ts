import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return user;
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
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
  async findByCodeConfirmation(
    confirmation_code: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.code': confirmation_code,
    });
    if (!user) {
      throw DomainException.notFound('User');
    }
    return user;
  }

  async findByRecoverPasswordCode(
    recover_code: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'recoverPasswordInfo.code': recover_code,
    });
    return user;
  }
}
