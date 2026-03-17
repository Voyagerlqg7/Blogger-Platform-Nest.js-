import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class UseCase_DeleteBlog
  implements ICommandHandler<DeleteBlogCommand, void>
{
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogRepository.findOrNotFoundFail(command.blogId);
    blog.makeDeleted();
    await this.blogRepository.saveBlog(blog);
  }
}
