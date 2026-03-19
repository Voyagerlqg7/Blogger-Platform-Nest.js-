import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/posts.entity';
import type { PostModelType } from '../domain/posts.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: string): Promise<PostDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);
    if (!post) {
      throw DomainException.notFound('Post');
    }
    return post;
  }
}
