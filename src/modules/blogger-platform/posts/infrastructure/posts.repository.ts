import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/posts.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';
import { ExtendedLikesInfoView } from '../api/view-dto/post-likes.view-dto';
import type { PostLikeModelType } from '../domain/post-likes.entity';
import type { PostModelType } from '../domain/posts.entity';
import { LikeStatus, PostLikes, PostLikeDocument } from '../domain/post-likes.entity';

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

  async getExtendedLikesInfo(
    postId: string,
    userId?: string,
  ): Promise<ExtendedLikesInfoView> {
    const [likesCount, dislikesCount, userLike, newestLikes] =
      await Promise.all([
        this.postLikeModel.countDocuments({ postId, status: LikeStatus.LIKE }),
        this.postLikeModel.countDocuments({
          postId,
          status: LikeStatus.DISLIKE,
        }),
        userId
          ? this.postLikeModel.findOne({ postId, userId }).lean()
          : Promise.resolve(null),
        this.postLikeModel
          .find({ postId, status: LikeStatus.LIKE })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
      ]);

    return ExtendedLikesInfoView.create({
      likesCount,
      dislikesCount,
      myStatus: userLike?.status ?? LikeStatus.NONE,
      newestLikes: newestLikes.map((like) => ({
        addedAt: like.createdAt,
        userId: like.userId,
        login: like.login,
      })),
    });
  }
}
