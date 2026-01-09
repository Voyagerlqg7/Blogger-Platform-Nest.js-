import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';
import { Post } from '../domain/posts.entity';
import type { PostModelType } from '../domain/posts.entity';
import { PostsViewDto } from '../api/view-dto/posts.view-dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: PostModelType,
    private blogRepository: BlogsRepository,
    private postRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<PostsViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail(dto.blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
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

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postRepository.save(post);
  }
}
