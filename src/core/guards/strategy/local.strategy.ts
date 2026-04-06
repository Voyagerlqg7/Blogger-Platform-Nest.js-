import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../../modules/user-accounts/application/auth/auth.service';
import { DomainException } from '../../exceptions/domain-exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string) {
    const user = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );

    if (!user) {
      throw DomainException.unauthorized('Invalid credentials');
    }
    return user;
  }
}
