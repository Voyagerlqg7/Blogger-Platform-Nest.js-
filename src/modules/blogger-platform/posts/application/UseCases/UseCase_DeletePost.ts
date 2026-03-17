import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class UseCase_DeletePost
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(command.postId);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
