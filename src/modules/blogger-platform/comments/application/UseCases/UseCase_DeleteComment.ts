import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class DeleteCommentCommand {
  constructor(public readonly commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommandHandler
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      command.commentId,
    );
    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
