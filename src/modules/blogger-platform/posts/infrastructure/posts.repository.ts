import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/Mongo/posts.mongo.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';
import type { PostLikeModelType } from '../domain/Mongo/post-likes.mongo.entity';
import type { PostModelType } from '../domain/Mongo/posts.mongo.entity';
import { PostLikes, PostLikeDocument } from '../domain/Mongo/post-likes.mongo.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    @InjectModel(PostLikes.name) private postLikeModel: PostLikeModelType,
  ) {}

  async findById(id: string): Promise<PostDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.postModel.findOne({ _id: id, deletedAt: null });
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);
    if (!post) throw DomainException.notFound('Post');
    return post;
  }

  // Методы для работы с лайками
  async findPostLike(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.postLikeModel.findOne({ postId, userId });
  }

  async savePostLike(postLike: PostLikeDocument): Promise<void> {
    await postLike.save();
  }

  async deletePostLike(postLike: PostLikeDocument): Promise<void> {
    await postLike.deleteOne();
  }
}
