import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import type { BlogModelType } from '../domain/blogs.entity';
import { Injectable } from '@nestjs/common';
import { PostDocument } from '../../posts/domain/posts.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: string): Promise<BlogDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async saveBlog(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }

  async savePostForSpecificBlog(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);
    if (!blog) {
      throw DomainException.notFound('Blog');
    }
    return blog;
  }
}
