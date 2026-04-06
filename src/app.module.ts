import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggerPlatform } from './modules/blogger-platform/blogger-platform.module';
import { TestingModule } from './testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exception.filter';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10,
          limit: 5,
        },
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('LOCAL_MONGODB_URI');
        if (!uri) {
          throw new Error('LOCAL_MONGODB_URI is not defined');
        }
        return { uri };
      },
    }),
    CqrsModule.forRoot(),
    UserAccountsModule,
    BloggerPlatform,
    TestingModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
