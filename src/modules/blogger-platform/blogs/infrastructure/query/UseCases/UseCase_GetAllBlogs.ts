import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../blogs.query-repository';
import { BlogsViewDto } from '../../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../../core/dto/base.paginated.view-dto';
import { QueryFilter } from 'mongoose';
import { BlogDocument } from '../../../domain/blogs.entity';
import { SortDirection } from '../../../../../../core/dto/base.query-params.input-dto';

export class GetAllBlogsQuery {
  constructor(public params: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsHandler
  implements IQueryHandler<GetAllBlogsQuery, PaginatedViewDto<BlogsViewDto[]>>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute(
    query: GetAllBlogsQuery,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const { params } = query;

    const filter: QueryFilter<BlogDocument> = {
      deletedAt: null,
    };

    if (params.searchNameTerm) {
      filter.$or = [{ name: { $regex: params.searchNameTerm, $options: 'i' } }];
    }

    const allowedSortFields = ['name', 'createdAt', 'websiteUrl'];
    const sortBy =
      params.sortBy && allowedSortFields.includes(params.sortBy)
        ? params.sortBy
        : 'createdAt';

    const sortDirection = params.sortDirection || SortDirection.Desc;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
    };

    const blogs = await this.blogsQueryRepository.findWithPagination(
      filter,
      sort,
      params.calculateSkip(),
      params.pageSize,
    );

    const totalCount = await this.blogsQueryRepository.count(filter);

    const items = blogs.map((blog) => BlogsViewDto.mapToView(blog));

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / params.pageSize),
      page: params.pageNumber,
      size: params.pageSize,
      totalCount,
      items,
    });
  }
}
