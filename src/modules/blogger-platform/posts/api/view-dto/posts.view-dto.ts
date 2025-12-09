import { PostDocument } from '../../domain/posts.entity';
import type { ExtendedLikesInfoView } from './post-likes.view-dto';

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoView;

  static mapToView(post: PostDocument): PostsViewDto {
    const dto = new PostsViewDto();
    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: post.likesCount ?? 0,
      dislikesCount: post.dislikesCount ?? 0,
      myStatus: 'None',
      newestLikes: [],
    };
    return dto;
  }
}
