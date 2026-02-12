import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { isItEmailDTO } from '../dto/auth_dto/email.dto';
import { loginDTO } from '../dto/auth_dto/login.dto';
import { newPasswordDTO } from '../dto/auth_dto/new_password.dto';
import { registrationUserDTO } from '../dto/auth_dto/registration.dto';
import { codeDto } from '../dto/auth_dto/registration_confirmation.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() dto: loginDTO): Promise<void> {}

  @Post('password-recovery')
  async password_recovery(@Body() dto: isItEmailDTO) {}

  @Post('new-password')
  async new_password(@Body() dto: newPasswordDTO): Promise<void> {}

  @Post('registration-confirmation')
  async registration_confirmation(@Body() dto: codeDto) {}

  @Post('registration')
  async registration(@Body() dto: registrationUserDTO) {
    return
  }

  @Post('registration-email-resending')
  async registration_email_resending(@Body() dto: isItEmailDTO) {}

  @Get('me')
  async about_me() {}
}
