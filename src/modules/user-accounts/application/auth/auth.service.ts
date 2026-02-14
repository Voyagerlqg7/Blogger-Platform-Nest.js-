import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { registrationUserDTO } from '../../dto/auth_dto/registration.dto';
import { PasswordService } from './password.service';
import { loginDTO } from '../../dto/auth_dto/login.dto';
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

  async checkCredentials(loginOrEmail: string, password: string) {
    const passwordHash =
      await this.usersRepository.getPasswordHash(loginOrEmail);
    const isValid: boolean = await this.passwordService.comparePassword(
      password,
      passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }
  }

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

  async signIn(dto: loginDTO) {
    const user = await this.usersRepository.findByLoginOrEmail(
      dto.loginOrEmail,
    );
    await this.checkCredentials(dto.loginOrEmail, dto.password);
    const payload = { sub: user._id, userLogin: user.login };
    const access_token = await this.JWTService.signAsync(payload);
    return access_token;
  }

  async sendCode() {}

  async resetPassword() {}

  async confirmAccount() {}

  async resendCode() {}
}
