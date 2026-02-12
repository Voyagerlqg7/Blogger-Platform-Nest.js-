import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserViewDto } from '../api/view-dto/users.view-dto';
import { registrationUserDTO } from '../dto/auth_dto/registration.dto';
import { PasswordService } from './password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly passwordService: PasswordService,
    private usersRepository: UsersRepository,
  ) {}

  async registerUser(dto: registrationUserDTO): Promise<UserViewDto> {
    const hash = await this.passwordService.generateHash(dto.password);
    const user = this.userModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: hash,
    });
    await this.usersRepository.save(user);
    return UserViewDto.mapToView(user);
  }
  async signIn(){


  }}
