import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import type { CommentModelType } from '../domain/comment.entity';
import { CommentDocument } from '../domain/comment.entity';
import { Types } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.CommentModel.findOne({
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
}
