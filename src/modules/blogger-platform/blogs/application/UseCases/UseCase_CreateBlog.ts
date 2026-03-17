import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blogs.entity';
import type { BlogModelType } from '../../domain/blogs.entity';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsViewDto } from '../../api/view-dto/blogs.view-dto';

@Injectable()
export class UseCase_CreateBlog {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
    private readonly blogRepository: BlogsRepository,
  ) {}

  async execute(dto: CreateBlogDto): Promise<BlogsViewDto> {
    const blog = this.blogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogRepository.saveBlog(blog);
    return BlogsViewDto.mapToView(blog);
  }
}
