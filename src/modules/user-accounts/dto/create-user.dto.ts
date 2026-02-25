import { IsEmail, IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class CreateUserDto {
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

