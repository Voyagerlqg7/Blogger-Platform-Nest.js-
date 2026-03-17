import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../../../posts/domain/posts.entity';
import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { PostsViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { Post } from '../../../posts/domain/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
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
      likesCount: 0,
      dislikesCount: 0,
    });
    await this.blogRepository.savePostForSpecificBlog(post);
    return PostsViewDto.mapToView(post);
  }
}
