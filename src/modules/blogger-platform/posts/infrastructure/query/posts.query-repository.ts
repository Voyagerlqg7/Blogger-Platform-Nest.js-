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

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
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

    const extendedLikesInfo = await this.postsRepository.getExtendedLikesInfo(
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
        this.postsRepository
          .getExtendedLikesInfo(post._id.toString(), userId)
          .then((extendedLikesInfo) =>
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
}
