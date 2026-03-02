import { IsNotEmpty, IsEmail } from 'class-validator';

export class EmailDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
