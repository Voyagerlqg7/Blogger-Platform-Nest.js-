import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UseCase_UpdatePost
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(private readonly postRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.postRepository.findOrNotFoundFail(command.postId);
    post.update(command.dto);
    await this.postRepository.save(post);
  }
}
