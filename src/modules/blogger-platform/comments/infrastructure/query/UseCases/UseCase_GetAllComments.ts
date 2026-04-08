import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../../core/dto/base.paginated.view-dto';
import { QueryFilter } from 'mongoose';
import { SortDirection } from '../../../../../../core/dto/base.query-params.input-dto';
import { GetCommentsQueryParams } from '../../../api/input-dto/get-comments-query-params.input-dto';
import { CommentsViewDto } from '../../../api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../comments.query-repository';
import { CommentDocument } from '../../../domain/comment.entity';
import { PostsQueryRepository } from '../../../../posts/infrastructure/query/posts.query-repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';

export class GetAllCommentsQuery {
  constructor(
    public postId: string,
    public params: GetCommentsQueryParams,
    public userId?: string,
  ) {}
}

@QueryHandler(GetAllCommentsQuery)
export class GetAllCommentsHandler
  implements
    IQueryHandler<GetAllCommentsQuery, PaginatedViewDto<CommentsViewDto[]>>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    _query: GetAllCommentsQuery,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const { params } = _query;

    const post = await this.postsQueryRepository.getByIdOrNotFoundFail(
      _query.postId,
    );
    if (post.deletedAt !== null) {
      throw DomainException.notFound('Post');
    }
    const filter: QueryFilter<CommentDocument> = {
      postId: _query.postId,
      deletedAt: null,
    };

    const allowedSortFields = ['createdAt'];
    const sortBy =
      params.sortBy && allowedSortFields.includes(params.sortBy)
        ? params.sortBy
        : 'createdAt';

    const sortDirection = params.sortDirection || SortDirection.Desc;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
    };

    const comments = await this.commentsQueryRepository.findWithPagination(
      filter,
      sort,
      params.calculateSkip(),
      params.pageSize,
    );

    const totalCount = await this.commentsQueryRepository.count(filter);

    const items = await Promise.all(
      comments.map(async (comment) => {
        const likesInfo = await this.commentsQueryRepository.getLikesInfo(
          comment._id.toString(),
          _query.userId,
        );
        return CommentsViewDto.mapToView(comment, likesInfo);
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
