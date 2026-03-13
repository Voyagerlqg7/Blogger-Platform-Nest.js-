import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../infrastructure/users.repository';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UseCase_CheckEmailCodeConfirmation {
  constructor(private readonly userRepository: UsersRepository,
  ) {}

  async execute(code: string): Promise<boolean> {
    const user = await this.userRepository.findByCodeConfirmation(code);
    if (!user) {
      throw DomainException.validationFailed([
        new Extension('User does not exist or incorrect code', 'code'),
      ]);
    }
    user.confirmEmail(code);
    await this.userRepository.save(user);
    return true;
  }
}
