import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as PassportBasicStrategy } from 'passport-http';
import { ConfigService } from '@nestjs/config';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class BasicStrategy extends PassportStrategy(PassportBasicStrategy) {
  constructor(private configService: ConfigService) {
    super();
  }

  validate(username: string, password: string): any {
    const validUsername = this.configService.get('BASIC_AUTH_USERNAME');
    const validPassword = this.configService.get('BASIC_AUTH_PASSWORD');

    if (username !== validUsername || password !== validPassword) {
      throw DomainException.unauthorized('Invalid credentials');
    }

    return { username, role: 'admin' };
  }
}
