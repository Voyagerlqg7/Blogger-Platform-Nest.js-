import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import type { CommentModelType } from '../../domain/comment.entity';
import { LikesInfoViewDto } from '../../api/view-dto/comments-likes.view-dto';
import { CommentLike } from '../../domain/Schema/commentatorLikeInfo.schema';
import type { CommentLikeModelType } from '../../domain/Schema/commentatorLikeInfo.schema';
import { LikeStatus } from '../../../posts/domain/post-likes.entity';
import { CommentsViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentDocument } from '../../domain/comment.entity';

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

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentsViewDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid comment id');
    }

    const comment = await this.commentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const likesInfo = await this.getLikesInfo(id, userId);

    return CommentsViewDto.mapToView(comment, likesInfo);
  }

  async getAllByPostId(
    postId: string,
    query: any,
    userId?: string,
  ): Promise<any> {
    const filter = { postId, deletedAt: null };

    const sortOptions: Record<string, 1 | -1> = {
      [query.sortBy || 'createdAt']: query.sortDirection === 'asc' ? 1 : -1,
    };

    const [comments, totalCount] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort(sortOptions)
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean(),
      this.commentModel.countDocuments(filter),
    ]);

    const items = await Promise.all(
      comments.map(async (comment) => {
        const likesInfo = await this.getLikesInfo(
          comment._id.toString(),
          userId,
        );
        return CommentsViewDto.mapToView(comment as CommentDocument, likesInfo);
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    };
  }
}
