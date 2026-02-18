import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(userLogin: string, password: string) {
    const user = await this.authService.checkCredentials(userLogin, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
