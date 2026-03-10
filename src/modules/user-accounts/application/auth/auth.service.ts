import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { registrationUserDTO } from '../../dto/auth_dto/registration.dto';
import { PasswordService } from '../external/password.service';
import type { SessionModelType } from '../../domain/session.entity';
import { CreateSessionDto } from '../../dto/auth_dto/create-session.dto';
import { SessionRepository } from '../../infrastructure/sessions.repository';
import { Session } from '../../domain/session.entity';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './payload/JwtPayload';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async generateTokens(userId: string, login: string) {
    const payload: JwtPayload = {
      userId: userId,
      userLogin: login,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET_KEY'),
      expiresIn: '5m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async checkCredentials(
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

  async registerUser(dto: registrationUserDTO): Promise<UserViewDto> {
    const errors: Array<{ message: string; field: string }> = [];

    const existingUser = await this.usersRepository.findByLoginOrEmail(
      dto.login,
    );
    if (existingUser) {
      errors.push({
        message: 'User with this login already exists',
        field: 'login',
      });
    }
    const existingEmail = await this.usersRepository.findByLoginOrEmail(
      dto.email,
    );
    if (existingEmail) {
      errors.push({
        message: 'User with this email already exists',
        field: 'email',
      });
    }
    if (errors.length > 0) {
      throw new BadRequestException({
        errorsMessages: errors,
      });
    }
    const salt = await this.passwordService.generatePasswordSalt();
    const hash = await this.passwordService.generateHash(dto.password, salt);
    const user = this.userModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: hash,
      passwordSalt: salt,
    });

    await this.usersRepository.save(user);
    return UserViewDto.mapToView(user);
  }

  async createSession(dto: CreateSessionDto): Promise<void> {
    const session = this.sessionModel.createInstance(dto, 20_000);
    await this.sessionRepository.save(session);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        },
      );
      return this.generateTokens(payload.userId, payload.userLogin);
    } catch (e) {
      throw DomainException.unauthorized('Invalid refresh token');
    }
  }
}
