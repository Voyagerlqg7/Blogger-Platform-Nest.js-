import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../posts.query-repository';
import { LikesQueryRepository } from '../likes.query-repository';
import { PostsViewDto } from '../../../api/view-dto/posts.view-dto';

export class GetPostByIdQuery {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler
  implements IQueryHandler<GetPostByIdQuery, PostsViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(query: GetPostByIdQuery): Promise<PostsViewDto> {
    const { postId, userId } = query;

    const post = await this.postsQueryRepository.getByIdOrNotFoundFail(postId);

    const extendedLikesInfo =
      await this.likesQueryRepository.getExtendedLikesInfo(postId, userId);

    return PostsViewDto.mapToView(post, extendedLikesInfo);
  }
}
