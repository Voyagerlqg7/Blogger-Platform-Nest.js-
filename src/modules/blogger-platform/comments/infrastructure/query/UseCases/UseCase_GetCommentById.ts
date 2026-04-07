import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../comments.query-repository';
import { CommentsViewDto } from '../../../api/view-dto/comments.view-dto';

export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: string,
    public readonly userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentsViewDto>
{
  constructor(private commentQueryRepository: CommentsQueryRepository) {}

  async execute(query: GetCommentByIdQuery) {
    const comment = await this.commentQueryRepository.getByIdOrNotFoundFail(
      query.commentId,
    );
    const likesInfo = await this.commentQueryRepository.getLikesInfo(
      query.commentId,
      query.userId,
    );
    return CommentsViewDto.mapToView(comment, likesInfo);
  }
}
