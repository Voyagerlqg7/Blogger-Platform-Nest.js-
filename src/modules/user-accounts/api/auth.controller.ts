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
import { LocalAuthGuard } from '../../../core/guards/local-auth.guard';
import { TokensRepository } from '../infrastructure/tokens.repository';
import { UserConfirmationService } from '../application/external/user-confirmation.service';
import { UserViewDto } from './view-dto/users.view-dto';
import { randomUUID } from 'crypto';
import { CreateSessionDto } from '../dto/auth_dto/create-session.dto';
import { HttpException, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/UseCases/Auth/UseCase_RegisterUser';
import { GenerateTokensCommand } from '../application/UseCases/Auth/UseCase_GenerateTokens';
import { UserLoggedInEvent } from '../application/Events/CreateSession';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { RefreshTokensCommand } from '../application/UseCases/Auth/UseCase_RefreshTokens';
import { RefreshTokenGuard } from '../../../core/guards/refresh-token.guard';
import { LogoutCommand } from '../application/UseCases/Auth/UseCase_Logout';
import { SimpleIpThrottlerGuard } from '../../../core/guards/simple-ip-throttler.guard';
import { AccessTokenGuard } from '../../../core/guards/access-token.guard';

export interface TokenType {
  accessToken: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly confirmationService: UserConfirmationService,
    private readonly tokenRepository: TokensRepository,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  @UseGuards(SimpleIpThrottlerGuard, LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @CurrentUser() user: UserViewDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const deviceId: string = randomUUID();
    const tokens: TokenType = await this.commandBus.execute(
      new GenerateTokensCommand(user.id.toString(), deviceId),
    );
    if (!req.ip) {
      throw new HttpException('ip address is empty!', 400);
    }
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10 * 1000,
    });
    const dto: CreateSessionDto = {
      userId: user.id,
      deviceId: deviceId,
      ip: req.ip,
      title: req.headers['user-agent'] ?? 'Unknown device',
    };

    this.eventBus.publish(new UserLoggedInEvent(dto));
    await this.tokenRepository.saveToken(tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(SimpleIpThrottlerGuard)
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: registrationUserDTO): Promise<void> {
    await this.commandBus.execute<CreateUserCommand, UserViewDto>(
      new CreateUserCommand(body),
    );
  }

  @Post('password-recovery')
  @UseGuards(SimpleIpThrottlerGuard)
  async password_recovery(@Body() dto: EmailDTO) {
    await this.confirmationService.sendRecoverPasswordCode(dto.email);
  }

  @UseGuards(SimpleIpThrottlerGuard)
  @Post('new-password')
  async new_password(@Body() dto: newPasswordDTO): Promise<void> {
    await this.confirmationService.checkCodeRecoverPassword(
      dto.recoveryCode,
      dto.newPassword,
    );
  }

  @UseGuards(SimpleIpThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration_confirmation(@Body() dto: codeDto) {
    await this.confirmationService.checkCodeConfirmation(dto.code);
  }

  @UseGuards(SimpleIpThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration_email_resending(@Body() dto: EmailDTO) {
    await this.confirmationService.resendCodeConfirmation(dto.email);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  getMe(@CurrentUser() user: UserViewDto) {
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const command = new LogoutCommand(req.refreshToken!, req.deviceId!);
    await this.commandBus.execute(command);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldToken = req.refreshToken!;
    const tokens: TokenType = await this.commandBus.execute(
      new RefreshTokensCommand(oldToken),
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10,
    });
    await this.tokenRepository.saveToken(tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }
}
