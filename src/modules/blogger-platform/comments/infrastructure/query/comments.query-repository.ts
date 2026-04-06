import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { QueryFilter } from 'mongoose';
import type { CommentModelType } from '../../domain/comment.entity';
import { LikesInfoViewDto } from '../../api/view-dto/comments-likes.view-dto';
import { CommentLike } from '../../domain/Schema/commentatorLikeInfo.schema';
import type { CommentLikeModelType } from '../../domain/Schema/commentatorLikeInfo.schema';
import { LikeStatus } from '../../../posts/domain/post-likes.entity';
import { CommentDocument, Comment } from '../../domain/comment.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private commentLikeModel: CommentLikeModelType,
  ) {}

  async getLikesInfo(
    commentId: string,
    userId?: string,
  ): Promise<LikesInfoViewDto> {
    const [likesCount, dislikesCount, userLike] = await Promise.all([
      this.commentLikeModel.countDocuments({
        commentId,
        status: LikeStatus.LIKE,
      }),
      this.commentLikeModel.countDocuments({
        commentId,
        status: LikeStatus.DISLIKE,
      }),
      userId
        ? this.commentLikeModel.findOne({ commentId, userId }).lean()
        : Promise.resolve(null),
    ]);

    return {
      likesCount,
      dislikesCount,
      myStatus: userLike?.status ?? LikeStatus.NONE,
    };
  }

  async getByIdOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.commentModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!comment) {
      throw DomainException.notFound('Comment');
    }
    return comment;
  }

  async findWithPagination(
    filter: QueryFilter<CommentDocument>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<CommentDocument[]> {
    return this.commentModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter: QueryFilter<CommentDocument>): Promise<number> {
    return this.commentModel.countDocuments(filter);
  }
}
