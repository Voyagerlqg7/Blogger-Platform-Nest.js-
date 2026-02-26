import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

interface JwtPayload {
  userId: string;
  userLogin: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET_KEY!,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.userId,
      userLogin: payload.userLogin,
    };
  }
}
