import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/Mongo/user.mongo.entity';
import { Session, SessionSchema } from './domain/Mongo/session.mongo.entity';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersMongoRepository } from './infrastructure/users.mongo.repository';
import { SessionRepository } from './infrastructure/sessions.mongo.repository';
import { AuthController } from './api/auth.controller';
import { JwtStrategy } from '../../core/guards/strategy/jwt.strategy';
import { LocalStrategy } from '../../core/guards/strategy/local.strategy';
import { PasswordService } from './application/external/password.service';
import { AuthService } from './application/auth/auth.service';
import { EmailService } from './application/external/email.service';
import { UserConfirmationService } from './application/external/user-confirmation.service';
import { TokensMongoRepository } from './infrastructure/tokens.mongo.repository';
import { Token, TokenSchema } from './domain/Mongo/token.mongo.entity';
import { BasicStrategy } from '../../core/guards/strategy/basic.strategy';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from '../../core/exceptions/filters/domain-exception.filter';
import { AllHttpExceptionsFilter } from '../../core/exceptions/filters/all-exceptions';
import {
  userAccountsEvents,
  userAccountsUseCases,
} from './user-accounts.all-use-cases';
import { CqrsModule } from '@nestjs/cqrs';
import { SecurityController } from './api/security-devices.controller';

@Module({
  imports: [
    CqrsModule,
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
  controllers: [UsersController, AuthController, SecurityController],
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
    TokensMongoRepository,
    UsersMongoRepository,
    SessionRepository,
    JwtStrategy,
    LocalStrategy,
    PasswordService,
    AuthService,
    EmailService,
    UserConfirmationService,
    BasicStrategy,
    ...userAccountsEvents,
    ...userAccountsUseCases,
  ],
  exports: [
    UsersService,
    UsersMongoRepository,
    UsersQueryRepository,
    SessionRepository,
    TokensMongoRepository,
    PasswordService,
    JwtModule,
    ...userAccountsEvents,
    ...userAccountsUseCases,
  ],
})
export class UserAccountsModule {}
