import { Comment } from '../entities/blogs layer/comment/comment.entity';
import { CommentLikes } from '../entities/blogs layer/comment/commentatorLikesInfo.entity';

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;

  findOrNotFoundFail(id: string): Promise<Comment>;

  save(comment: Comment): Promise<Comment>;

  findCommentLike(commentId: string, userId: string): Promise<Comment>;

  saveCommentLike(commentLike: CommentLikes): Promise<void>;
}
