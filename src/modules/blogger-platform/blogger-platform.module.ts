import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { BlogService } from './blogs/application/blog.service';
import { PostService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';

@Module({
  imports: [],
  providers: [BlogService, PostService, PostsRepository, BlogsRepository],
  controllers: [BlogsController, PostsController],
  exports: [],
})
export class BloggerPlatform {}
