import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../blogs.query-repository';
import { BlogsViewDto } from '../../../api/view-dto/blogs.view-dto';

export class GetBlogByIdQuery {
  constructor(public readonly blogId: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdHandler
  implements IQueryHandler<GetBlogByIdQuery, BlogsViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogByIdQuery): Promise<BlogsViewDto> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      query.blogId,
    );
    return BlogsViewDto.mapToView(blog);
  }
}
