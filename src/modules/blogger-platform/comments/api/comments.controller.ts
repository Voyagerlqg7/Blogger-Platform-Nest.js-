import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Delete,
  UseGuards,
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
import { CurrentUser } from '../../../../core/decorators/current-user.decorator';
import { UpdateCommentCommand } from '../application/UseCases/UseCase_UpdateComment';
import { GetCommentByIdQuery } from '../infrastructure/query/UseCases/UseCase_GetCommentById';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getCommentById(
    @Param('id') commentId: string,
    @CurrentUser() user?: UserViewDto,
  ): Promise<CommentsViewDto> {
    return await this.queryBus.execute(
      new GetCommentByIdQuery(commentId, user?.id),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: UserViewDto,
  ): Promise<void> {
    const command = new UpdateCommentCommand(commentId, dto, user.id);
    await this.commandBus.execute(command);
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('id') commentId: string,
    @Body() dto: LikeStatusDto,
    @CurrentUser() user: UserViewDto,
  ): Promise<void> {
    const command = new UpdateCommentLikeStatusCommand(
      commentId,
      user.id,
      dto.likeStatus,
    );
    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUser() user: UserViewDto,
  ): Promise<void> {
    const command = new DeleteCommentCommand(commentId, user.id);
    await this.commandBus.execute(command);
  }
}
