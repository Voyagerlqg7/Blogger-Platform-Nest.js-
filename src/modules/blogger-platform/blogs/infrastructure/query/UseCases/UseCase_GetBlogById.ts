import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../blogs.query-repository';
import { BlogsViewDto } from '../../../api/view-dto/blogs.view-dto';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';

export class GetBlogByIdQuery {
  constructor(public readonly blogId: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogHandler
  implements IQueryHandler<GetBlogByIdQuery, BlogsViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogByIdQuery) {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      query.blogId,
    );
    if (!blog) {
      throw DomainException.notFound('Blog');
    }
    return BlogsViewDto.mapToView(blog);
  }
}
