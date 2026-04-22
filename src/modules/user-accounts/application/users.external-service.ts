import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/Mongo/user.mongo.entity';
import type { UserModelType } from '../domain/Mongo/user.mongo.entity';
import { UsersMongoRepository } from '../infrastructure/users.mongo.repository';

@Injectable()
export class UsersExternalService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersMongoRepository,
  ) {}

  async makeUserAsSpammer(userId: string) {
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    //TODO: make rate limiter
    // user.makeSpammer();

    await this.usersRepository.save(user);
  }
}
