import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import type { PostLikeModelType } from '../../domain/post-likes.entity';
import { PostLikes } from '../../domain/post-likes.entity';
import { LikeStatus } from '../../domain/post-likes.entity';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public userLogin: string,
    public likeStatus: string,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UseCase_UpdatePostLikeStatus
  implements ICommandHandler<UpdatePostLikeStatusCommand, void>
{
  constructor(
    @InjectModel(PostLikes.name) private postLikeModel: PostLikeModelType,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<void> {
    // Проверяем существование поста
    await this.postsRepository.findOrNotFoundFail(command.postId);

    // Ищем существующий лайк
    const existingLike = await this.postsRepository.findPostLike(
      command.postId,
      command.userId,
    );

    // Если статус None и лайка нет - ничего не делаем
    if (command.likeStatus === LikeStatus.NONE && !existingLike) {
      return;
    }

    // Если статус None и лайк есть - удаляем
    if (command.likeStatus === LikeStatus.NONE && existingLike) {
      await this.postsRepository.deletePostLike(existingLike);
      return;
    }

    // Если лайка нет - создаем новый
    if (!existingLike) {
      const newLike = this.postLikeModel.createInstance({
        postId: command.postId,
        userId: command.userId,
        login: command.userLogin,
        likeStatus: command.likeStatus,
      });
      await this.postsRepository.savePostLike(newLike);
      return;
    }

    // Если лайк есть и статус изменился - обновляем
    if (existingLike.status !== command.likeStatus) {
      existingLike.updateStatus(command.likeStatus);
      await this.postsRepository.savePostLike(existingLike);
    }
  }
}
