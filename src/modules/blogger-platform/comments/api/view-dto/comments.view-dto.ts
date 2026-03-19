import { CommentDocument } from '../../domain/comment.entity';
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
    const dto = new CommentsViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = likesInfo;

    return dto;
  }
}
