import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionViewDto } from '../../../api/view-dto/session.view-dto';
import { JwtPayload } from '../../auth/payload/JwtPayload';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokensRepository } from '../../../infrastructure/tokens.repository';
import { SessionRepository } from '../../../infrastructure/sessions.repository';

export class GetAllDevicesQuery {
  constructor(
    public _refreshToken: string,
    public userId: string,
  ) {}
}

@QueryHandler(GetAllDevicesQuery)
export class UseCase_GetAllDevices
  implements IQueryHandler<GetAllDevicesQuery, SessionViewDto[]>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokensRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(_query: GetAllDevicesQuery): Promise<SessionViewDto[]> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      _query._refreshToken,
      { secret: this.configService.get('JWT_REFRESH_SECRET_KEY') },
    );

    await this.tokenRepository.findToken(_query._refreshToken);
    const session = await this.sessionRepository.findByDeviceId(
      payload.deviceId,
    );

    if (session.sessionExpiresAt < new Date()) {
      await this.tokenRepository.deleteToken(_query._refreshToken);
      throw DomainException.unauthorized('Session expired');
    }
    const sessions = await this.sessionRepository.findSessionsByUserId(
      _query.userId,
    );

    return sessions.map((one_session) => SessionViewDto.mapToView(one_session));
  }
}
