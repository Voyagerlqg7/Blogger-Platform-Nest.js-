import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import type { CommentModelType } from '../domain/comment.entity';
import { CommentDocument } from '../domain/comment.entity';
import { Types } from 'mongoose';
import { CommentLike } from '../domain/Schema/commentatorLikeInfo.schema';
import type { CommentLikeModelType } from '../domain/Schema/commentatorLikeInfo.schema';
import { CommentLikeDocument } from '../domain/Schema/commentatorLikeInfo.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private commentLikeModel: CommentLikeModelType,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.commentModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async findOrNotFoundFail(commentId: string): Promise<CommentDocument> {
    const comment = await this.findById(commentId);
    if (!comment) {
      throw DomainException.notFound('Comment');
    }
    return comment;
  }

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }

  async findCommentLike(commentId: string, userId: string) {
    return this.commentLikeModel.findOne({ commentId, userId });
  }

  async saveCommentLike(commentLike: CommentLikeDocument): Promise<void> {
    await commentLike.save();
  }

  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    newStatus: string,
  ): Promise<void> {
    await this.commentLikeModel.updateOne(
      { commentId, userId },
      { status: newStatus },
    );
  }
}
