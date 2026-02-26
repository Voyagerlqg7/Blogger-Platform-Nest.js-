import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserViewDto } from '../api/view-dto/users.view-dto';
import { PasswordService } from './external/password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly passwordService: PasswordService,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserViewDto> {
    const salt: string = await this.passwordService.generatePasswordSalt();
    const hash: string = await this.passwordService.generateHash(
      dto.password,
      salt,
    );
    const user = this.userModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: hash,
      passwordSalt: salt,
    });
    await this.usersRepository.save(user);
    return UserViewDto.mapToView(user);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }
}
