import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { PostDocument, Post } from '../../domain/Mongo/posts.mongo.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!post) {
      throw DomainException.notFound('Post');
    }
    return post;
  }

  async findWithPagination(
    filter: QueryFilter<PostDocument>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<PostDocument[]> {
    return this.postModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter: QueryFilter<PostDocument>): Promise<number> {
    return this.postModel.countDocuments(filter);
  }
}
