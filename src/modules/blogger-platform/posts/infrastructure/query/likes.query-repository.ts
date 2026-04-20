import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLikes, PostLikeDocument } from '../../domain/Mongo/post-likes.mongo.entity';
import { LikeStatus } from '../../domain/Mongo/post-likes.mongo.entity';
import { ExtendedLikesInfoView } from '../../api/view-dto/post-likes.view-dto';

@Injectable()
export class LikesQueryRepository {
  constructor(
    @InjectModel(PostLikes.name) private postLikeModel: Model<PostLikeDocument>,
  ) {}

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
