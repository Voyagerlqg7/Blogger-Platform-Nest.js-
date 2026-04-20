import { Post } from '../../entities/blogs layer/post/post.entity';
import { PostLikes } from '../../entities/blogs layer/post/postLikesInfo.entity';

export interface IPostsRepository {
  findById(id: string): Promise<Post | null>;

  save(post: Post): Promise<Post>;

  findOfNotFoundFail(id: string): Promise<Post>;

  findPostLike(postId: string, userId: string): Promise<PostLikes | null>;

  savePostLike(postLike: PostLikes): Promise<void>;

  deletePostLike(id: string): Promise<void>;
}
