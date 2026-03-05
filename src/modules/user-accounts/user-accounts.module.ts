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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'secret-key',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    SessionRepository,
    JwtStrategy,
    LocalStrategy,
    PasswordService,
    AuthService,
    EmailService,
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
