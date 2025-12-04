import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Blog,
  BlogSchema,
} from '../modules/blogger-platform/blogs/domain/blogs.entity';
import {
  Post,
  PostSchema,
} from '../modules/blogger-platform/posts/domain/posts.entity';
import { User, UserSchema } from '../modules/user-accounts/domain/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
