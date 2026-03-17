import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogsViewDto } from '../api/view-dto/blogs.view-dto';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { UseCase_CreateBlog } from './UseCases/UseCase_CreateBlog';
import { UseCase_UpdateBlog } from './UseCases/UseCase_UpdateBlog';
import { UseCase_DeleteBlog } from './UseCases/UseCase_DeleteBlog';
import { UseCase_CreatePostForBlog } from './UseCases/UseCase_CreatePostForBlog';

@Injectable()
export class BlogService {
  constructor(
    private readonly createBlogUseCase: UseCase_CreateBlog,
    private readonly updateBlogUseCase: UseCase_UpdateBlog,
    private readonly deleteBlogUseCase: UseCase_DeleteBlog,
    private readonly createPostForBlogUseCase: UseCase_CreatePostForBlog,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogsViewDto> {
    return await this.createBlogUseCase.execute(dto);
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    await this.updateBlogUseCase.execute(id, dto);
  }

  async deleteBlog(id: string): Promise<void> {
    await this.deleteBlogUseCase.execute(id);
  }

  async createPostForSpecificBlog(
    blogId: string,
    dto: CreatePostForBlogDto,
  ): Promise<PostsViewDto> {
    return await this.createPostForBlogUseCase.execute(blogId, dto);
  }
}
