import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { EmailDTO } from '../dto/auth_dto/email.dto';
import type { Request, Response } from 'express';
import { newPasswordDTO } from '../dto/auth_dto/new_password.dto';
import { registrationUserDTO } from '../dto/auth_dto/registration.dto';
import { codeDto } from '../dto/auth_dto/registration_confirmation.dto';
import { AuthService } from '../application/auth/auth.service';
import { LocalAuthGuard } from '../../../core/guards/local-auth.guard';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { TokensRepository } from '../infrastructure/tokens.repository';
import { UserConfirmationService } from '../application/external/user-confirmation.service';
import { UserViewDto } from './view-dto/users.view-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly confirmationService: UserConfirmationService,
    private readonly tokenRepository: TokensRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const user = req.user as any;
    const tokens = await this.authService.generateTokens(
      user.id.toString(),
      user.login,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await this.tokenRepository.saveToken(tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('registration')
  async registration(@Body() dto: registrationUserDTO) {
    const user: UserViewDto = await this.authService.registerUser(dto);
    await this.confirmationService.sendConfirmationMessage(user.id, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password-recovery')
  async password_recovery(@Body() dto: EmailDTO) {
    await this.confirmationService.sendRecoverPasswordCode(dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('new-password')
  async new_password(@Body() dto: newPasswordDTO): Promise<void> {
    await this.confirmationService.checkCodeRecoverPassword(
      dto.recoveryCode,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('registration-confirmation')
  async registration_confirmation(@Body() dto: codeDto) {
    await this.confirmationService.checkCodeConfirmation(dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('registration-email-resending')
  async registration_email_resending(@Body() dto: EmailDTO) {
    await this.confirmationService.resendCodeConfirmation(dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async about_me() {}
}
