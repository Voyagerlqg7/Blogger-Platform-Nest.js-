import { Controller, Get, Post } from '@nestjs/common';

@Controller()
export class AuthController {
  @Post()
  async login() {}

  @Post()
  async password_recovery() {}

  @Post()
  async new_password() {}

  @Post()
  async registration_confirmation() {}

  @Post()
  async registration() {}

  @Post()
  async registration_email_resending() {}

  @Get()
  async about_me() {}
}
