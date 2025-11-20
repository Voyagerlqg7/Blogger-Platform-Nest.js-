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
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Controller('posts')
export class PostsController {
  @Get()
  async getAllPosts(@Query() query: any) {}

  @Get(':id')
  async getPostById(@Param('id') postId: string) {}

  @Get(':id/comments')
  async getAllCommentsFromSpecificPost(
    @Param('id') postId: string,
    @Query() query: any,
  ) {}

  @Post()
  async createPost(@Body() newPost: CreatePostDto) {}

  @Delete(':id')
  async deletePost(@Param('id') postId: string) {}

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {}
}
