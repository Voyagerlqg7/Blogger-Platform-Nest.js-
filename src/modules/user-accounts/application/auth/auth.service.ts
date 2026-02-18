import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { registrationUserDTO } from '../../dto/auth_dto/registration.dto';
import { PasswordService } from './password.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly passwordService: PasswordService,
    private readonly JWTService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  async generateTokens(userId: string, login: string) {
    const payload = {
      sub: userId,
      userLogin: login,
    };

    const accessToken = await this.JWTService.signAsync(payload, {
      expiresIn: '5m',
    });

    const refreshToken = await this.JWTService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<boolean> {
    const passwordHash =
      await this.usersRepository.getPasswordHash(loginOrEmail);
    const isValid: boolean = await this.passwordService.comparePassword(
      password,
      passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return true;
  }

  async registerUser(dto: registrationUserDTO): Promise<UserViewDto> {
    if (
      (await this.usersRepository.findByLoginOrEmail(dto.login)) ||
      (await this.usersRepository.findByLoginOrEmail(dto.login))
    ) {
      throw new UnauthorizedException(
        'User with this login or email already exists',
      );
    }
    const hash = await this.passwordService.generateHash(dto.password);
    const user = this.userModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: hash,
    });
    await this.usersRepository.save(user);
    return UserViewDto.mapToView(user);
  }

  async sendCode() {}

  async resetPassword() {}

  async confirmAccount() {}

  async resendCode() {}
}
