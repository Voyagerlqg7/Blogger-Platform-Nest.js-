import { InjectModel } from '@nestjs/mongoose';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { ExtendedLikesInfoView } from '../../api/view-dto/post-likes.view-dto';
import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../../domain/posts.entity';
import { PostLikes, LikeStatus } from '../../domain/post-likes.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import type { PostModelType } from '../../domain/posts.entity';
import type { PostLikeModelType } from '../../domain/post-likes.entity';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    @InjectModel(PostLikes.name) private postLikeModel: PostLikeModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostsViewDto> {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw DomainException.notFound('Post');
    }

    const extendedLikesInfo = await this.getExtendedLikesInfo(
      post._id.toString(),
      userId,
    );
    return PostsViewDto.mapToView(post, extendedLikesInfo);
  }

  async getAll(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const filter = {
      deletedAt: null,
    };

    const sortDirection = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const sortBy: string = query.sortBy || 'createdAt';
    const sortOptions: any = {};
    sortOptions[sortBy] = sortDirection;

    const posts = await this.postModel
      .find(filter)
      .sort(sortOptions)
      .skip(query.calculateSkip())
      .limit(query.pageSize)

    const totalCount = await this.postModel.countDocuments(filter);

    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo = await this.getExtendedLikesInfo(
          post._id.toString(),
          userId,
        );
        return PostsViewDto.mapToView(post as PostDocument, extendedLikesInfo);
      }),
    );

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  private async getExtendedLikesInfo(
    postId: string,
    userId?: string,
  ): Promise<ExtendedLikesInfoView> {
    const likesCount = await this.postLikeModel.countDocuments({
      postId,
      status: LikeStatus.LIKE,
    });

    const dislikesCount = await this.postLikeModel.countDocuments({
      postId,
      status: LikeStatus.DISLIKE,
    });

    let myStatus: string = LikeStatus.NONE;
    if (userId) {
      const userLike = await this.postLikeModel.findOne({
        postId,
        userId,
      });
      if (userLike) {
        myStatus = userLike.status;
      }
    }
    // Lasts three likes
    const newestLikes = await this.postLikeModel
      .find({
        postId,
        status: LikeStatus.LIKE,
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return ExtendedLikesInfoView.create({
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes: newestLikes.map((like) => ({
        addedAt: like.createdAt,
        userId: like.userId,
        login: like.login,
      })),
    });
  }
}
