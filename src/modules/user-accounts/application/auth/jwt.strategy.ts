import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { UnauthorizedException } from '@nestjs/common';

export type JwtPayload = {
  userId: string;
  deviceId?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET_KEY!,
    });
  }

  async validate(payload: JwtPayload): Promise<UserViewDto> {
    const user = await this.usersRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return UserViewDto.mapToView(user);
  }
}
