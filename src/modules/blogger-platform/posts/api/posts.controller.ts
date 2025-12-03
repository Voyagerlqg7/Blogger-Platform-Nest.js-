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
import { PostService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PostsViewDto } from './view-dto/posts.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postService: PostService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllPosts(@Query() query: any): Promise<PostsViewDto[]> {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string): Promise<PostsViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  /*@Get(':id/comments')
  async getAllCommentsFromSpecificPost(
    @Param('id') postId: string,
    @Query() query: any,
  ) {}*/

  @Post()
  async createPost(@Body() newPost: CreatePostDto) {
    return this.postService.createPost(newPost);
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    return this.postService.deletePost(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(postId, updatePostDto);
  }
}
