import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../domain/blogs.entity';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogsViewDto } from '../api/view-dto/blogs.view-dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel('Blog')
    private BlogModel: BlogModelType,
    private blogRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogsViewDto> {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });
    await this.blogRepository.save(blog);
    return BlogsViewDto.mapToView(blog);
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<string> {
    const blog = await this.blogRepository.findOrNotFoundFail(id);
    blog.update(dto);
    await this.blogRepository.save(blog);
    return blog._id.toString();
  }

  async deleteBlog(id: string) {
    const blog = await this.blogRepository.findOrNotFoundFail(id);
    blog.makeDeleted();
    await this.blogRepository.save(blog);
  }
}
