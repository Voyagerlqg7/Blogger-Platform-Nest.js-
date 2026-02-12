import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class newPasswordDTO {
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(6)
  newPassword: string;
  @IsNotEmpty()
  recoveryCode: string;
}
