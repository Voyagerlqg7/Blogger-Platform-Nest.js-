import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import type { BlogModelType } from '../domain/blogs.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostDocument } from '../../posts/domain/posts.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async saveBlog(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async savePostForSpecificBlog(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }
}
