import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { PasswordService } from '../../external/password.service';
import { registrationUserDTO } from '../../../dto/auth_dto/registration.dto';
import { UserViewDto } from '../../../api/view-dto/users.view-dto';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exceptions';
import type { UserModelType } from '../../../domain/user.entity';
import { User } from '../../../domain/user.entity';

@Injectable()
export class UseCase_RegisterUser {
  constructor(
    private usersRepository: UsersRepository,
    private passwordService: PasswordService,
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
  ) {}

  async execute(dto: registrationUserDTO): Promise<UserViewDto> {
    const errors: Extension[] = [];

    const existingUser = await this.usersRepository.findByLoginOrEmail(
      dto.login,
    );
    if (existingUser) {
      errors.push(
        new Extension('User with this login already exists', 'login'),
      );
    }

    const existingEmail = await this.usersRepository.findByLoginOrEmail(
      dto.email,
    );
    if (existingEmail) {
      errors.push(
        new Extension('User with this email already exists', 'email'),
      );
    }

    if (errors.length > 0) {
      throw DomainException.validationFailed(errors);
    }
    const salt = await this.passwordService.generatePasswordSalt();
    const hash = await this.passwordService.generateHash(dto.password, salt);
    const user = this.userModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: hash,
      passwordSalt: salt,
      isConfirmed: false,
    });

    await this.usersRepository.save(user);
    return UserViewDto.mapToView(user);
  }
}
