import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentDto,
  ) {}
}

@CommandHandler(UpdateCommentDto)
export class UseCase_UpdateComment
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(public readonly commentRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentRepository.findOrNotFoundFail(
      command.commentId,
    );
    comment.updateComment(command.dto);
  }
}
