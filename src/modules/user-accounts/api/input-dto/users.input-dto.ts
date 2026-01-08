import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
export class CreateUserInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  login: string;
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
