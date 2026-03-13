import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { registrationUserDTO } from '../../dto/auth_dto/registration.dto';
import { CreateSessionDto } from '../../dto/auth_dto/create-session.dto';

import { UseCase_GenerateTokens } from '../UseCases/Auth/UseCase_GenerateTokens';
import { UseCase_CheckCredentials } from '../UseCases/Auth/UseCase_CheckCredentials';
import { UseCase_RegisterUser } from '../UseCases/Auth/UseCase_RegisterUser';
import { UseCase_CreateSession } from '../UseCases/Auth/UseCase_CreateSession';
import { UseCase_RefreshTokens } from '../UseCases/Auth/UseCase_RefreshTokens';

@Injectable()
export class AuthService {
  constructor(
    private readonly generateTokensUseCase: UseCase_GenerateTokens,
    private readonly checkCredentialsUseCase: UseCase_CheckCredentials,
    private readonly registerUserUseCase: UseCase_RegisterUser,
    private readonly createSessionUseCase: UseCase_CreateSession,
    private readonly refreshTokensUseCase: UseCase_RefreshTokens,
  ) {}

  async generateTokens(userId: string, login: string) {
    return await this.generateTokensUseCase.execute(userId, login);
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserViewDto | null> {
    return await this.checkCredentialsUseCase.execute(loginOrEmail, password);
  }

  async registerUser(dto: registrationUserDTO): Promise<UserViewDto> {
    return await this.registerUserUseCase.execute(dto);
  }

  async createSession(dto: CreateSessionDto): Promise<void> {
    return await this.createSessionUseCase.execute(dto);
  }

  async refreshTokens(refreshToken: string) {
    return await this.refreshTokensUseCase.execute(refreshToken);
  }
}
