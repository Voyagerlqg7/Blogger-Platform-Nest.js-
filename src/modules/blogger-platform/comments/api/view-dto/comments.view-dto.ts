import { CommentDocument } from '../../domain/Mongo/comment.mongo.entity';
import { LikesInfoViewDto } from './comments-likes.view-dto';

export class CommentsViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewDto;

  static mapToView(
    comment: CommentDocument,
    likesInfo: LikesInfoViewDto,
  ): CommentsViewDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo,
    };
  }
}
