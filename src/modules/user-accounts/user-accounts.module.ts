import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [],
    exports: [],
})
export class UserAccountsModule {}