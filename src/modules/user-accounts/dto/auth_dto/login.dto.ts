import { IsNotEmpty } from 'class-validator';

export class loginDTO {
  @IsNotEmpty()
  loginOeEmail: string;
  @IsNotEmpty()
  password: string;
}
