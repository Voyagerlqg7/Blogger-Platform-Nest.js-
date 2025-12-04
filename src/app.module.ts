import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggerPlatform } from './modules/blogger-platform/blogger-platform.module';

const mongoURI: string = process.env.LOCAL_MONGODB_URI!;

@Module({
  imports: [
    MongooseModule.forRoot(mongoURI),
    UserAccountsModule,
    BloggerPlatform,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
