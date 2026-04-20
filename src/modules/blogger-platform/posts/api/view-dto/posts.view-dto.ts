import { ExtendedLikesInfoView } from './post-likes.view-dto';
import { PostDocument } from '../../domain/Mongo/posts.mongo.entity';

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
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo,
    };
  }
}
