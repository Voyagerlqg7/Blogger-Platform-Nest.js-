import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CommentsViewDto } from './view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCommentLikeStatusCommand } from '../application/UseCases/UseCase_RateComment';
import { UserViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';
import { DeleteCommentCommand } from '../application/UseCases/UseCase_DeleteComment';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params.input-dto';
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UpdateCommentCommand } from '../application/UseCases/UseCase_UpdateComment';
import { GetAllCommentsQuery } from '../infrastructure/query/UseCases/UseCase_GetAllComments';
import { GetCommentByIdQuery } from '../infrastructure/query/UseCases/UseCase_GetCommentById';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
    @CurrentUser() user?: UserViewDto,
  ): Promise<CommentsViewDto> {
    return await this.commandBus.execute(
      new GetCommentByIdQuery(commentId, user?.id),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<void> {
    const command = new UpdateCommentCommand(commentId, dto);
    await this.commandBus.execute(command);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateLikeStatus(
    @Param('id') commentId: string,
    @Body() dto: LikeStatusDto,
    @CurrentUser() user: UserViewDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, user.id, dto.likeStatus),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param() commentId: string): Promise<void> {
    const command = new DeleteCommentCommand(commentId);
    await this.commandBus.execute(command);
  }

  @Get(':id')
  async getAllCommentsForPost(
    @Param('id') postId: string,
    @Query() query: GetCommentsQueryParams,
    @CurrentUser() user?: UserViewDto,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    return await this.queryBus.execute(
      new GetAllCommentsQuery(postId, query, user?.id),
    );
  }
}
