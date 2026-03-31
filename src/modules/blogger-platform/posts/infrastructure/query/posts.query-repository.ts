import { InjectModel } from '@nestjs/mongoose';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../../domain/posts.entity';
import type { PostModelType } from '../../domain/posts.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { PostsRepository } from '../posts.repository';
import { ExtendedLikesInfoView } from '../../api/view-dto/post-likes.view-dto';
import type { PostLikeModelType } from '../../domain/post-likes.entity';
import { PostLikes } from '../../domain/post-likes.entity';
import { LikeStatus } from '../../domain/post-likes.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    @InjectModel(PostLikes.name) private postLikeModel: PostLikeModelType,
    private readonly postsRepository: PostsRepository,
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
    const filter = { deletedAt: null };

    // Формируем сортировку
    const sortOptions: Record<string, 1 | -1> = {
      [query.sortBy || 'createdAt']:
        query.sortDirection === SortDirection.Asc ? 1 : -1,
    };

    // Параллельно выполняем запросы для оптимизации
    const [posts, totalCount] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(sortOptions)
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean(), // Используем lean() для производительности
      this.postModel.countDocuments(filter),
    ]);

    // Параллельно получаем extendedLikesInfo для всех постов
    const items = await Promise.all(
      posts.map((post) =>
        this.getExtendedLikesInfo(post._id.toString(), userId).then(
          (extendedLikesInfo) =>
            PostsViewDto.mapToView(post as PostDocument, extendedLikesInfo),
        ),
      ),
    );

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  //TODO: Move this code to CQRS query
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
