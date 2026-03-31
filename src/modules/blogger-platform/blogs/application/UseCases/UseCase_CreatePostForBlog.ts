import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../../../posts/domain/posts.entity';
import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { PostsViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { Post } from '../../../posts/domain/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public dto: CreatePostForBlogDto,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class UseCase_CreatePostForBlog
  implements ICommandHandler<CreatePostForBlogCommand, PostsViewDto>
{
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private readonly blogRepository: BlogsRepository,
    private readonly postQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: CreatePostForBlogCommand): Promise<PostsViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail(command.blogId);
    if (!blog) {
      throw DomainException.notFound('Blog');
    }
    const post = this.postModel.createInstance({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: command.blogId,
      blogName: blog.name,
    });
    await this.blogRepository.savePostForSpecificBlog(post);
    const extendedLikesInfo =
      await this.postQueryRepository.getExtendedLikesInfo(
        post._id.toString(),
        command.userId,
      );
    return PostsViewDto.mapToView(post, extendedLikesInfo);
  }
}
