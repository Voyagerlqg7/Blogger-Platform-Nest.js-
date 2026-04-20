import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { Blog, BlogSchema } from './blogs/domain/Mongo/blogs.mongo.entity';
import { Post, PostSchema } from './posts/domain/Mongo/posts.mongo.entity';
import { Comment, CommentSchema } from './comments/domain/Mongo/comment.mongo.entity';
import { CommentsController } from './comments/api/comments.controller';
import { PostLikes, PostLikeSchema } from './posts/domain/Mongo/post-likes.mongo.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { BlogService } from './blogs/application/blog.service';
import { PostService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { bloggerPlatformUseCases } from './blogger-platfrom.all-use-cases';

import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/Mongo/Schema/commentatorLikeInfo.schema';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { LikesQueryRepository } from './posts/infrastructure/query/likes.query-repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostLikes.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  providers: [
    BlogService,
    PostService,
    PostsRepository,
    BlogsRepository,
    CommentsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    LikesQueryRepository,
    CommentsQueryRepository,
    ...bloggerPlatformUseCases,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  exports: [...bloggerPlatformUseCases],
})
export class BloggerPlatform {}
