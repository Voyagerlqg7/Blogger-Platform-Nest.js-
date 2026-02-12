import { IsNotEmpty, IsEmail } from 'class-validator';

export class isItEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
