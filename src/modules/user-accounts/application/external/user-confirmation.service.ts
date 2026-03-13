import { Injectable } from '@nestjs/common';
import { UseCase_CheckEmailCodeConfirmation } from '../UseCases/Confirmation/UseCase_CheckEmailCodeConfirmation';
import { UseCase_CheckRecoverCodePassword } from '../UseCases/Confirmation/UseCase_CheckRecoverCodePassword';
import { UseCase_SendConfirmationMessage } from '../UseCases/Confirmation/UseCase_SendConfirmationMessage';
import { UseCase_SendRecoverPasswordCode } from '../UseCases/Confirmation/UseCase_SendRecoverPasswordCode';
import { UseCase_ResendCodeConfirmation } from '../UseCases/Confirmation/UseCase_ResendCodeConfirmation';

@Injectable()
export class UserConfirmationService {
  constructor(
    private readonly sendConfirmationMessageUseCase: UseCase_SendConfirmationMessage,
    private readonly sendRecoverPasswordCodeUseCase: UseCase_SendRecoverPasswordCode,
    private readonly resendCodeConfirmationUseCase: UseCase_ResendCodeConfirmation,
    private readonly checkRecoverCodePasswordUseCase: UseCase_CheckRecoverCodePassword,
    private readonly checkEmailCodeConfirmationUseCase: UseCase_CheckEmailCodeConfirmation,
  ) {}

  async sendConfirmationMessage(userId: string, email: string): Promise<void> {
    await this.sendConfirmationMessageUseCase.execute(userId, email);
  }

  async sendRecoverPasswordCode(email: string): Promise<void> {
    await this.sendRecoverPasswordCodeUseCase.execute(email);
  }

  async resendCodeConfirmation(email: string): Promise<void> {
    await this.resendCodeConfirmationUseCase.execute(email);
  }

  async checkCodeConfirmation(code: string): Promise<boolean> {
    return await this.checkEmailCodeConfirmationUseCase.execute(code);
  }

  async checkCodeRecoverPassword(
    code: string,
    new_password: string,
  ): Promise<boolean> {
    return await this.checkRecoverCodePasswordUseCase.execute(
      code,
      new_password,
    );
  }
}
