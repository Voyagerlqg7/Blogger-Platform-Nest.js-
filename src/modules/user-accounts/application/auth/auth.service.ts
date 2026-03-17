import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { UseCase_CheckCredentials } from '../UseCases/Auth/UseCase_CheckCredentials';

@Injectable()
export class AuthService {
  constructor(
    private readonly checkCredentialsUseCase: UseCase_CheckCredentials,
  ) {}

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserViewDto | null> {
    return await this.checkCredentialsUseCase.execute(loginOrEmail, password);
  }
}
