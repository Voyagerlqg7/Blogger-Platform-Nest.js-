import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../../dto/create-post.dto';
import { Post } from '../../domain/posts.entity';
import type { PostModelType } from '../../domain/posts.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class CreatePostCommand {
  constructor(
    public dto: CreatePostDto,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class UseCase_CreatePost
  implements ICommandHandler<CreatePostCommand, PostsViewDto>
{
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    private postsRepository: PostsRepository,
    private postQueryRepository: PostsQueryRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostsViewDto> {
    const blog = await this.blogsRepository.findOrNotFoundFail(
      command.dto.blogId,
    );

    const post = this.postModel.createInstance({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: command.dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    const extendedLikesInfo =
      await this.postQueryRepository.getExtendedLikesInfo(
        post._id.toString(),
        command.userId,
      );

    return PostsViewDto.mapToView(post, extendedLikesInfo);
  }
}
