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
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { BlogService } from '../application/blog.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllBlogs(@Query() query: any) {
    await
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
  }

  @Get(':id/posts')
  async getAllPostsFromBlog(@Param('id') blogId: string, @Query() query: any) {
  }

  @Post(':id/posts')
  async createPostsForSpecificBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    return;
  }

  @Put(':id')
  async updateBlog(@Param('id') blogId: string, @Body() body: CreateBlogDto) {
    return;
  }

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return;
  }
}
