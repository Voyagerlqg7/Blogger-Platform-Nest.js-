import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UseCase_UpdateBlog
  implements ICommandHandler<UpdateBlogCommand, void>
{
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogRepository.findOrNotFoundFail(command.blogId);
    blog.update(command.dto);
    await this.blogRepository.saveBlog(blog);
  }
}
