import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PasswordService } from '../application/external/password.service';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private readonly passwordService: PasswordService,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async getPasswordHash(loginOrEmail: string): Promise<string> {
    const user = await this.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }
    return user.passwordHash;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }
    return user;
  }

  //TODO:MOVE all next methods TO DDD (into user entity)
  async findByCodeConfirmation(
    confirmation_code: string,
  ): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.code': confirmation_code,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async findByRecoverPasswordCode(recover_code: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'recoverPasswordInfo.code': recover_code,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async updateStatusConfirmation(user: UserDocument): Promise<void> {
    await this.UserModel.updateOne(
      { id: user._id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
  }

  async updateCodeConfirmationAndExpiresTime(
    userId: string,
    newCode: string,
    newExpiresAt: string,
  ): Promise<void> {
    await this.UserModel.updateOne(
      { id: userId },
      {
        $set: {
          'emailConfirmation.confirmationCode': newCode,
          'emailConfirmation.expiresAt': new Date(newExpiresAt),
          'emailConfirmation.isConfirmed': false,
        },
      },
    );
  }

  async setNewPassword(userId: string, newPassword: string) {
    const passwordSalt = await this.passwordService.generatePasswordSalt();
    const passwordHash = await this.passwordService.generateHash(
      newPassword,
      passwordSalt,
    );
    await this;
    this.UserModel.updateOne(
      {
        id: userId,
      },
      {
        $set: {
          passwordHash: passwordHash,
          passwordSalt: passwordSalt,
        },
        $unset: {
          'recoverPasswordInfo.expiresAt': '',
          'recoverPasswordInfo.code': '',
        },
      },
    );
  }
}
