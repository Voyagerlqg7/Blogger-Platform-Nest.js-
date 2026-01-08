import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../domain/blogs.entity';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogsViewDto } from '../api/view-dto/blogs.view-dto';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { Blog } from '../domain/blogs.entity';
import { Post } from '../../posts/domain/posts.entity';
import type { PostModelType } from '../../posts/domain/posts.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModelType,
    private blogRepository: BlogsRepository,
    private postRepository: PostsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogsViewDto> {
    const blog = this.blogModel.createInstance(dto);
    await this.blogRepository.saveBlog(blog);
    return BlogsViewDto.mapToView(blog);
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<string> {
    const blog = await this.blogRepository.findOrNotFoundFail(id);
    blog.update(dto);
    await this.blogRepository.saveBlog(blog);
    return blog._id.toString();
  }

  async deleteBlog(id: string) {
    const blog = await this.blogRepository.findOrNotFoundFail(id);
    blog.makeDeleted();
    await this.blogRepository.saveBlog(blog);
  }

  async createPostForSpecificBlog(
    blogId: string,
    dto: CreatePostForBlogDto,
  ): Promise<PostsViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found for creating post');
    }
    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
    });
    await this.blogRepository.savePostForSpecificBlog(post);
    return PostsViewDto.mapToView(post);
  }
}
