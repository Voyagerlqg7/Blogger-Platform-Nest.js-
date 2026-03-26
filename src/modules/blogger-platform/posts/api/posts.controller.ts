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
  UseGuards,
  Req,
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
import { LikeStatusDto } from '../../comments/dto/like-status.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UserViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';
import { UpdatePostLikeStatusCommand } from '../application/UseCases/UseCase_RatePost';
import { CreateCommentForPostCommand } from '../application/UseCases/UseCase_CreateCommentForPost';

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

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() newPost: CreatePostDto,
    @Req() req: Request,
  ): Promise<PostsViewDto> {
    const user = req.user as UserViewDto;
    const command = new CreatePostCommand(newPost, user.id);
    return this.commandBus.execute(command);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(postId, updatePostDto),
    );
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  async updateLikeStatus(
    @Param('id') postId: string,
    @Body() dto: LikeStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserViewDto;

    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(
        postId,
        user.id,
        user.login,
        dto.likeStatus,
      ),
    );
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserViewDto;
    await this.commandBus.execute(
      new CreateCommentForPostCommand(postId, dto, user),
    );
  }
}
