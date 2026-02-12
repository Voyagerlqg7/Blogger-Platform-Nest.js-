import { IsNotEmpty, IsEmail, MaxLength, MinLength } from 'class-validator';

export class registrationUserDTO {
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(3)
  login: string;
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(6)
  password: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
