import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../../dto/create-post.dto';
import type { PostModelType } from '../../domain/posts.entity';
import { Post } from '../../domain/posts.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class UseCase_CreatePost {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: PostModelType,
    private postRepository: PostsRepository,
    private blogRepository: BlogsRepository,
  ) {}

  async execute(dto: CreatePostDto): Promise<PostsViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail(dto.blogId);
    if (!blog) {
      throw DomainException.notFound('Blog');
    }
    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
      likesCount: 0,
      dislikesCount: 0,
    });
    await this.postRepository.save(post);
    return PostsViewDto.mapToView(post);
  }
}
