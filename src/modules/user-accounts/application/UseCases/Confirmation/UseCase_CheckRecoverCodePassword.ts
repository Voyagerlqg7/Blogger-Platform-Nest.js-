import { Injectable } from '@nestjs/common';
import { UsersMongoRepository } from '../../../infrastructure/users.mongo.repository';
import { PasswordService } from '../../external/password.service';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UseCase_CheckRecoverCodePassword {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly userRepository: UsersMongoRepository,
  ) {}

  async execute(code: string, new_password: string): Promise<boolean> {
    const user = await this.userRepository.findByRecoverPasswordCode(code);
    if (!user) {
      throw DomainException.validationFailed([
        new Extension(
          'Recover password code doesnt exist or incorrect',
          'recover password code',
        ),
      ]);
    }
    const salt: string = await this.passwordService.generatePasswordSalt();
    const hash: string = await this.passwordService.generateHash(
      new_password,
      salt,
    );
    user.updatePassword(code, hash, salt);
    await this.userRepository.save(user);
    return true;
  }
}
