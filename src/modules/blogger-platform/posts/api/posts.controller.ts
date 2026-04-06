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
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/UseCases/UseCase_CreatePost';
import { DeletePostCommand } from '../application/UseCases/UseCase_DeletePost';
import { UpdatePostCommand } from '../application/UseCases/UseCase_UpdatePost';
import { LikeStatusDto } from '../../comments/dto/like-status.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { UserViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';
import { UpdatePostLikeStatusCommand } from '../application/UseCases/UseCase_RatePost';
import { CreateCommentForPostCommand } from '../application/UseCases/UseCase_CreateCommentForPost';
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { GetAllPostsQuery } from '../infrastructure/query/UseCase/UseCase_GetAllPosts';
import { GetPostByIdQuery } from '../infrastructure/query/UseCase/UseCase_GetPostById';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
    @CurrentUser() user?: UserViewDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery(query, user?.id));
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostById(
    @Param('id') postId: string,
    @CurrentUser() user?: UserViewDto,
  ): Promise<PostsViewDto> {
    return this.queryBus.execute(new GetPostByIdQuery(postId, user?.id));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() newPost: CreatePostDto,
    @CurrentUser() user: UserViewDto,
  ): Promise<PostsViewDto> {
    const command = new CreatePostCommand(newPost, user.id);
    return this.commandBus.execute(command);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId),
    );
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('id') postId: string,
    @Body() dto: LikeStatusDto,
    @CurrentUser() user: UserViewDto,
  ): Promise<void> {
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
    @CurrentUser() user: UserViewDto,
  ) {
    await this.commandBus.execute(
      new CreateCommentForPostCommand(postId, dto, user),
    );
  }
}
