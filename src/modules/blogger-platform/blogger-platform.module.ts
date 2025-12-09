import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blogs.entity';
import { Post, PostSchema } from './posts/domain/posts.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { BlogService } from './blogs/application/blog.service';
import { PostService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  providers: [
    BlogService,
    PostService,
    PostsRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
  ],
  controllers: [BlogsController, PostsController],
  exports: [],
})
export class BloggerPlatform {}
