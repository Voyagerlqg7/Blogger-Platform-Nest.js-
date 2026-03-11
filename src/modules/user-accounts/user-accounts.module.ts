import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { Session, SessionSchema } from './domain/session.entity';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { SessionRepository } from './infrastructure/sessions.repository';
import { AuthController } from './api/auth.controller';
import { JwtStrategy } from './application/auth/jwt.strategy';
import { LocalStrategy } from './application/auth/local.strategy';
import { PasswordService } from './application/external/password.service';
import { AuthService } from './application/auth/auth.service';
import { EmailService } from './application/external/email.service';
import { UserConfirmationService } from './application/external/user-confirmation.service';
import { TokensRepository } from './infrastructure/tokens.repository';
import { Token, TokenSchema } from './domain/token.entity';
import { BasicStrategy } from './application/auth/basic.strategy';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from '../../core/exceptions/filters/domain-exception.filter';
import { AllHttpExceptionsFilter } from '../../core/exceptions/filters/all-exceptions';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET_KEY'),
      }),
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    UsersService,
    UsersQueryRepository,
    TokensRepository,
    UsersRepository,
    SessionRepository,
    JwtStrategy,
    LocalStrategy,
    PasswordService,
    AuthService,
    EmailService,
    UserConfirmationService,
    BasicStrategy,
  ],
  exports: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    SessionRepository,
    PasswordService,
    JwtModule,
  ],
})
export class UserAccountsModule {}
