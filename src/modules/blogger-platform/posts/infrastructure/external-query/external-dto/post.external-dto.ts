import { PostDocument } from '../../../domain/posts.entity';

export class PostExternalDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;

  static mapToView(post: PostDocument): PostExternalDto {
    const dto = new PostExternalDto();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    return dto;
  }
}
