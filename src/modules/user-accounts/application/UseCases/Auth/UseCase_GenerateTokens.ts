import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../auth/payload/JwtPayload';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GenerateTokensCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(GenerateTokensCommand)
export class UseCase_GenerateTokens
  implements
    ICommandHandler<
      GenerateTokensCommand,
      {
        accessToken: string;
        refreshToken: string;
      }
    >
{
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: GenerateTokensCommand) {
    const payload: JwtPayload = {
      userId: command.userId,
      deviceId: command.deviceId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET_KEY'),
      expiresIn: this.configService.get('ACCESS_TOKEN_LIVE_TIME'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      expiresIn: this.configService.get('REFRESH_TOKEN_LIVE_TIME'),
    });

    return { accessToken, refreshToken };
  }
}
