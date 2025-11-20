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

@Controller('blogs')
export class BlogsController {
  @Get()
  async getAllBlogs(@Query() query: any) {
    return;
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    return;
  }

  @Get(':id/posts')
  async getAllPostsFromBlog(@Param('id') blogId: string, @Query() query: any) {
    return;
  }

  @Post(':id/posts')
  async createPostsForSpecificBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return;
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
