import { PasswordService } from '../../external/password.service';
import { Injectable } from '@nestjs/common';
import { UsersMongoRepository } from '../../../infrastructure/Mongo/users.mongo.repository';
import { UserViewDto } from '../../../api/view-dto/users.view-dto';

@Injectable()
export class UseCase_CheckCredentials {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly usersRepository: UsersMongoRepository,
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
