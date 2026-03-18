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
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/UseCases/UseCase_CreatePost';
import { DeletePostCommand } from '../application/UseCases/UseCase_DeletePost';
import { UpdatePostCommand } from '../application/UseCases/UseCase_UpdatePost';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
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
  async createPost(@Body() newPost: CreatePostDto): Promise<PostsViewDto> {
    return this.commandBus.execute<CreatePostCommand, PostsViewDto>(
      new CreatePostCommand(newPost),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(postId, updatePostDto),
    );
  }
}
