import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Blog,
  BlogSchema,
} from '../modules/blogger-platform/blogs/domain/Mongo/blogs.mongo.entity';
import {
  Post,
  PostSchema,
} from '../modules/blogger-platform/posts/domain/Mongo/posts.mongo.entity';
import {
  PostLikes,
  PostLikeSchema,
} from '../modules/blogger-platform/posts/domain/Mongo/post-likes.mongo.entity';
import {
  Comment,
  CommentSchema,
} from '../modules/blogger-platform/comments/domain/Mongo/comment.mongo.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from '../modules/blogger-platform/comments/domain/Mongo/Schema/commentatorLikeInfo.schema';
import { User, UserSchema } from '../modules/user-accounts/domain/Mongo/user.mongo.entity';
import {
  Token,
  TokenSchema,
} from '../modules/user-accounts/domain/Mongo/token.mongo.entity';
import {
  Session,
  SessionSchema,
} from '../modules/user-accounts/domain/Mongo/session.mongo.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostLikes.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: Token.name, schema: TokenSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
