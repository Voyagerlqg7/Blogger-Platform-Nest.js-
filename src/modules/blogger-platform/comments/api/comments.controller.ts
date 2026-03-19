import { Controller, Get, Param, Put, Body, Delete } from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsViewDto } from './view-dto/comments.view-dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
  ): Promise<CommentsViewDto> {

  }

  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {}

  @Put(':id')
  async rateComment(@Param('id') commentId: string, @Body() dto: LikeStatusDto) {}

  @Delete(':id')
  async deleteComment(@Param() commentId: string) {}

  @Get(':id')
  async getAllCommentsForPost(@Param('id') postId: string) {}
}
