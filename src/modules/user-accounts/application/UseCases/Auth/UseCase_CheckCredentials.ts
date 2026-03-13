import { PasswordService } from '../../external/password.service';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserViewDto } from '../../../api/view-dto/users.view-dto';

@Injectable()
export class UseCase_CheckCredentials {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    loginOrEmail: string,
    password: string,
  ): Promise<UserViewDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }
    const isValid = await this.passwordService.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      return null;
    }
    return UserViewDto.mapToView(user);
  }
}
