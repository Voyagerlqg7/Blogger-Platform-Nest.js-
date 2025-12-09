// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggerPlatform } from './modules/blogger-platform/blogger-platform.module';
import { TestingModule } from './testing/testing.module';

@Module({
  imports: [
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
    UserAccountsModule,
    BloggerPlatform,
    TestingModule,
  ],
})
export class AppModule {}
