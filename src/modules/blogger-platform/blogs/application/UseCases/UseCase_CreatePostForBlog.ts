import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../../../posts/domain/posts.entity';
import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { PostsViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { Post } from '../../../posts/domain/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UseCase_CreatePostForBlog {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private readonly blogRepository: BlogsRepository,
  ) {}

  async execute(
    blogId: string,
    dto: CreatePostForBlogDto,
  ): Promise<PostsViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail(blogId);
    if (!blog) {
      throw DomainException.notFound('Blog');
    }
    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
      likesCount: 0,
      dislikesCount: 0,
    });
    await this.blogRepository.savePostForSpecificBlog(post);
    return PostsViewDto.mapToView(post);
  }
}
