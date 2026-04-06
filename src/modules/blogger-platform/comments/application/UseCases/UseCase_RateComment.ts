import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLike } from '../../domain/Schema/commentatorLikeInfo.schema';
import type { CommentLikeModelType } from '../../domain/Schema/commentatorLikeInfo.schema';
import { LikeStatus } from '../../domain/Schema/commentatorLikeInfo.schema';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UseCase_UpdateCommentLikeStatus
  implements ICommandHandler<UpdateCommentLikeStatusCommand, void>
{
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: CommentLikeModelType,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
    // Проверяем существование комментария
    await this.commentsRepository.findOrNotFoundFail(command.commentId);

    // Ищем существующий лайк
    const existingLike = await this.commentsRepository.findCommentLike(
      command.commentId,
      command.userId,
    );

    // Если статус None и лайка нет - ничего не делаем
    if (command.likeStatus === LikeStatus.NONE && !existingLike) {
      return;
    }

    // Если статус None и лайк есть - удаляем
    if (command.likeStatus === LikeStatus.NONE && existingLike) {
      await existingLike.deleteOne();
      return;
    }

    // Если лайка нет - создаем новый
    if (!existingLike) {
      const newLike = this.commentLikeModel.createInstance({
        commentId: command.commentId,
        userId: command.userId,
        likeStatus: command.likeStatus,
      });
      await this.commentsRepository.saveCommentLike(newLike);
      return;
    }

    // Если лайк есть и статус изменился - обновляем
    if (existingLike.status !== command.likeStatus) {
      existingLike.updateStatus(command.likeStatus);
      await this.commentsRepository.saveCommentLike(existingLike);
    }
  }
}
