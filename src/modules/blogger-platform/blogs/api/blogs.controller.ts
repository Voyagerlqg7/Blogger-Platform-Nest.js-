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

import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogsViewDto } from './view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostForBlogCommand } from '../application/UseCases/UseCase_CreatePostForBlog';
import { DeleteBlogCommand } from '../application/UseCases/UseCase_DeleteBlog';
import { UpdateBlogCommand } from '../application/UseCases/UseCase_UpdateBlog';
import { CreateBlogCommand } from '../application/UseCases/UseCase_CreateBlog';
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';
import { UserViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { GetAllBlogsQuery } from '../infrastructure/query/UseCases/UseCase_GetAllBlogs';
import { GetBlogByIdQuery } from '../infrastructure/query/UseCases/UseCase_GetBlogById';
import {OptionalJwtAuthGuard} from "../../../../core/guards/optional-jwt-auth.guard";

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() queryParams: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.queryBus.execute(new GetAllBlogsQuery(queryParams));
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string): Promise<BlogsViewDto> {
    return this.queryBus.execute(new GetBlogByIdQuery(blogId));
  }

  @Get(':id/posts')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllPostsFromBlog(
    @Param('id') blogId: string,
    @Query() query: GetPostsQueryParams,
    @CurrentUser() user?: UserViewDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.blogsQueryRepository.getAllPostsFromSpecialBlog(
      blogId,
      query,
      user?.id,
    );
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostsForSpecificBlog(
    @Param('id') blogId: string,
    @CurrentUser() user: UserViewDto,
    @Body() dto: CreatePostForBlogDto,
  ): Promise<PostsViewDto> {
    return this.commandBus.execute<CreatePostForBlogCommand, PostsViewDto>(
      new CreatePostForBlogCommand(blogId, user.id, dto),
    );
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string): Promise<void> {
    await this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(blogId),
    );
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() body: UpdateBlogDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(blogId, body),
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogsViewDto> {
    return this.commandBus.execute<CreateBlogCommand, BlogsViewDto>(
      new CreateBlogCommand(createBlogDto),
    );
  }
}
