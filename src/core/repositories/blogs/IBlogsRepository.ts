import { Blog } from '../../entities/blogs layer/blog/blog.entity';
import { Post } from '../../entities/blogs layer/post/post.entity';

export interface IBlogsRepository {
  findById(id: string): Promise<Blog | null>;
  save(blog: Blog): Promise<Blog>;
  savePostForSpecificBlog(post: Post): Promise<Post>;
  findOrNotFoundFail(id: string): Promise<Blog>;
}
