import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class UseCase_DeleteComment
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      command.commentId,
    );
    if (comment.commentatorInfo.userId != command.userId) {
      throw DomainException.forbidden('Its not your comment', 'comment delete');
    }

    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
