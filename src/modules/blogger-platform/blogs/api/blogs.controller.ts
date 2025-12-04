import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Body,
} from '@nestjs/common';

import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { BlogService } from '../application/blog.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogsViewDto } from './view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-blogs-query-params.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string): Promise<BlogsViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':id/posts')
  async getAllPostsFromBlog(
    @Param('id') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.blogsQueryRepository.getAllPostsFromSpecialBlog(blogId, query);
  }

  @Post(':id/posts')
  async createPostsForSpecificBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ): Promise<PostsViewDto> {
    return this.blogService.createPostForSpecificBlog(blogId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string): Promise<void> {
    return this.blogService.deleteBlog(blogId);
  }

  @Put(':id')
  async updateBlog(@Param('id') blogId: string, @Body() body: UpdateBlogDto) {
    return this.blogService.updateBlog(blogId, body);
  }

  @Post()
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogsViewDto> {
    return this.blogService.createBlog(createBlogDto);
  }
}
