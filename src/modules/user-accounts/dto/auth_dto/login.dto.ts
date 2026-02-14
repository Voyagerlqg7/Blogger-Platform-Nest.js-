import { IsNotEmpty } from 'class-validator';

export class loginDTO {
  @IsNotEmpty()
  loginOrEmail: string;
  @IsNotEmpty()
  password: string;
}
