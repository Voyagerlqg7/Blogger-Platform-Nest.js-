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
import {
  PostLikes,
  PostLikeSchema,
} from '../modules/blogger-platform/posts/domain/post-likes.entity';
import {
  Comment,
  CommentSchema,
} from '../modules/blogger-platform/comments/domain/comment.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from '../modules/blogger-platform/comments/domain/Schema/commentatorLikeInfo.schema';
import { User, UserSchema } from '../modules/user-accounts/domain/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostLikes.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
