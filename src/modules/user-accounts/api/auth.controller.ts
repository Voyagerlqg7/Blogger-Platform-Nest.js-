import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { isItEmailDTO } from '../dto/auth_dto/email.dto';
import type { Request, Response } from 'express';
import { newPasswordDTO } from '../dto/auth_dto/new_password.dto';
import { registrationUserDTO } from '../dto/auth_dto/registration.dto';
import { codeDto } from '../dto/auth_dto/registration_confirmation.dto';
import { AuthService } from '../application/auth/auth.service';
import { LocalAuthGuard } from '../../../core/guards/local-auth.guard';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    //TODO: create user type in request.
    const tokens = await this.authService.generateTokens(
      user._id.toString(),
      user.login,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('password-recovery')
  async password_recovery(@Body() dto: isItEmailDTO) {}

  @UseGuards(JwtAuthGuard)
  @Post('new-password')
  async new_password(@Body() dto: newPasswordDTO): Promise<void> {}

  @UseGuards(JwtAuthGuard)
  @Post('registration-confirmation')
  async registration_confirmation(@Body() dto: codeDto) {}

  @UseGuards(JwtAuthGuard)
  @Post('registration')
  async registration(@Body() dto: registrationUserDTO) {}

  @UseGuards(JwtAuthGuard)
  @Post('registration-email-resending')
  async registration_email_resending(@Body() dto: isItEmailDTO) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async about_me() {}
}
