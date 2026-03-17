import { JwtPayload } from '../../auth/payload/JwtPayload';
import { JwtService } from '@nestjs/jwt';

import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { GenerateTokensCommand } from './UseCase_GenerateTokens';

export class RefreshTokenCommand {
  constructor(public _refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class UseCase_RefreshTokens
  implements
    ICommandHandler<
      RefreshTokenCommand,
      {
        accessToken: string;
        refreshToken: string;
      }
    >
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<any> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      command._refreshToken,
      { secret: this.configService.get('JWT_REFRESH_SECRET_KEY') },
    );

    return this.commandBus.execute(
      new GenerateTokensCommand(payload.userId, payload.userLogin),
    );
  }
}
