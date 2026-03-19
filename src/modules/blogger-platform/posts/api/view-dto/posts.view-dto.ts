import { PostDocument } from '../../domain/posts.entity';
import { ExtendedLikesInfoView } from './post-likes.view-dto';

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoView;

  static mapToView(
    post: PostDocument,
    extendedLikesInfo: ExtendedLikesInfoView,
  ): PostsViewDto {
    const dto = new PostsViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();
    dto.extendedLikesInfo = extendedLikesInfo;

    return dto;
  }
}
