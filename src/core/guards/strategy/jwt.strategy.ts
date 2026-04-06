import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../modules/user-accounts/infrastructure/users.repository';
import { UserViewDto } from '../../../modules/user-accounts/api/view-dto/users.view-dto';
import { JwtPayload } from '../../../modules/user-accounts/application/auth/payload/JwtPayload';
import { DomainException } from '../../exceptions/domain-exceptions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET_KEY')!,
    });
  }

  async validate(payload: JwtPayload): Promise<UserViewDto> {
    const user = await this.usersRepository.findById(payload.userId);

    if (!user) {
      throw DomainException.unauthorized('Invalid credentials');
    }

    return UserViewDto.mapToView(user);
  }
}
