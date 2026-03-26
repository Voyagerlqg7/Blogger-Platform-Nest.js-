import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsViewDto } from './view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentLikeStatusCommand } from '../application/UseCases/UseCase_RateComment';
import { UserViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
  ): Promise<CommentsViewDto> {}

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {}

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  async updateLikeStatus(
    @Param('id') commentId: string,
    @Body() dto: LikeStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserViewDto;

    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, user.id, dto.likeStatus),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param() commentId: string) {}

  @Get(':id')
  async getAllCommentsForPost(@Param('id') postId: string) {}
}
