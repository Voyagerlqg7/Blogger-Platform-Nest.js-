import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommentsViewDto } from '../../../comments/api/view-dto/comments.view-dto';
import { Comment } from '../../../comments/domain/Mongo/comment.mongo.entity';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from '../../../comments/domain/Mongo/comment.mongo.entity';
import { UserViewDto } from '../../../../user-accounts/api/view-dto/users.view-dto';
import { CommentsQueryRepository } from '../../../comments/infrastructure/query/comments.query-repository';

export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public dto: CreateCommentDto,
    public user: UserViewDto,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class UseCase_CreateCommentForPost
  implements ICommandHandler<CreateCommentForPostCommand, CommentsViewDto>
{
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
    private readonly postRepository: PostsRepository,
    private readonly commentRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    command: CreateCommentForPostCommand,
  ): Promise<CommentsViewDto> {
    await this.postRepository.findOrNotFoundFail(command.postId);

    const comment = this.commentModel.createInstance({
      content: command.dto.content,
      postId: command.postId,
      userId: command.user.id,
      userLogin: command.user.login,
    });

    await this.commentRepository.save(comment);

    const likesInfo = await this.commentsQueryRepository.getLikesInfo(
      comment._id.toString(),
      command.user.id,
    );

    return CommentsViewDto.mapToView(comment, likesInfo);
  }
}
