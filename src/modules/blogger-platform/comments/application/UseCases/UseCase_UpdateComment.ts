import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UseCase_UpdateComment
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(public readonly commentRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentRepository.findOrNotFoundFail(
      command.commentId,
    );
    if (comment.commentatorInfo.userId != command.userId) {
      throw DomainException.forbidden('Its not your comment', 'comment update');
    }
    comment.updateComment(command.dto);
    await this.commentRepository.save(comment);
  }
}
