import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../posts.query-repository';
import { LikesQueryRepository } from '../likes.query-repository';
import { PostsViewDto } from '../../../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../../core/dto/base.paginated.view-dto';
import { SortDirection } from '../../../../../../core/dto/base.query-params.input-dto';

export class GetAllPostsQuery {
  constructor(
    public params: GetPostsQueryParams,
    public userId?: string,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsHandler
  implements IQueryHandler<GetAllPostsQuery, PaginatedViewDto<PostsViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(
    query: GetAllPostsQuery,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const { params, userId } = query;

    const filter = { deletedAt: null };

    const sortBy = params.sortBy || 'createdAt';
    const sortDirection = params.sortDirection || SortDirection.Desc;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
    };

    const [posts, totalCount] = await Promise.all([
      this.postsQueryRepository.findWithPagination(
        filter,
        sort,
        params.calculateSkip(),
        params.pageSize,
      ),
      this.postsQueryRepository.count(filter),
    ]);

    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo =
          await this.likesQueryRepository.getExtendedLikesInfo(
            post._id.toString(),
            userId,
          );
        return PostsViewDto.mapToView(post, extendedLikesInfo);
      }),
    );

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / params.pageSize),
      page: params.pageNumber,
      size: params.pageSize,
      totalCount,
      items,
    });
  }
}
